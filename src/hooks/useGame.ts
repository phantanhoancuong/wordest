import { useEffect, useState } from "react";

import {
  ATTEMPTS,
  WORD_LENGTH,
  AnimationSpeedMultiplier,
  CellAnimation,
  CellStatus,
  GameState,
} from "@/lib/constants";

import { useAnimationTracker } from "@/hooks/useAnimationTracker";
import { useCursorController } from "@/hooks/useCursorController";
import { useGameState } from "@/hooks/useGameState";
import { useGridState } from "@/hooks/useGridState";
import { useGuessSubmission } from "@/hooks/useGuessSubmission";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useKeyStatuses } from "@/hooks/useKeyStatuses";
import { useSoundPlayer } from "@/hooks/useSoundPlayer";
import { useTargetWord } from "@/hooks/useTargetWord";
import { useToasts } from "@/hooks/useToasts";

import { UseGameReturn } from "@/types/useGame.types";

import { useSettingsContext } from "@/app/contexts/SettingsContext";
import { useGameStore } from "@/store/useGameStore";

/** Matches a single uppercase character, used to validate keyboard letter input. */
const LETTER_REGEX = /^[A-Z]$/;

/**
 * Hook to manage the state and logic of the game.
 *
 * Tracks the grid of guesses, keyboard statuses, game state, toasts, input handling, and sound playback.
 *
 * @returns Game controller and associated utilities.
 */
export const useGame = (): UseGameReturn => {
  const {
    targetWord,
    targetLetterCount,
    wordFetchError,
    reloadTargetWord,
    resetTargetWord,
  } = useTargetWord();

  const gameState = useGameState();
  const cursor = useCursorController();

  const [validationError, setValidationError] = useState("");
  const { toastList, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();
  const { volume, animationSpeed, isMuted } = useSettingsContext();

  const animationSpeedMultiplier =
    AnimationSpeedMultiplier[animationSpeed.value];

  const dataGameGrid = useGameStore((s) => s.gameGrid);
  const setDataGameGrid = useGameStore((s) => s.setGameGrid);
  const resetDataGameGrid = useGameStore((s) => s.resetGameGrid);
  const dataAnswerGrid = useGameStore((s) => s.answerGrid);
  const setDataAnswerGrid = useGameStore((s) => s.setAnswerGrid);
  const resetDataAnswerGrid = useGameStore((s) => s.resetAnswerGrid);

  const gameGrid = useGridState(
    ATTEMPTS,
    WORD_LENGTH,
    CellStatus.DEFAULT,
    CellAnimation.NONE,
    0,
    dataGameGrid,
    setDataGameGrid,
    resetDataGameGrid
  );

  const answerGrid = useGridState(
    1,
    WORD_LENGTH,
    CellStatus.HIDDEN,
    CellAnimation.NONE,
    0,
    dataAnswerGrid,
    setDataAnswerGrid,
    resetDataAnswerGrid
  );

  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    isMuted.value ? 0 : volume.value
  );

  const gameId = useGameStore((s) => s.gameId);
  const incrementGameId = useGameStore((s) => s.incrementGameId);
  const answerGridId = useGameStore((s) => s.answerGridId);
  const setAnswerGridId = useGameStore((s) => s.setAnswerGridId);

  /**
   * Initializes the answer grid for the current game.
   *
   * The answer grid is populated once per gameId using the current target word.
   * 'answerGridId' is used to prevent re-initialization when resuming or re-rendering the same game.
   *
   * This effect runs when:
   * - A new target word is loaded.
   * - A new gameId is issued.
   */
  useEffect(() => {
    if (!targetWord) return;

    // Resume the game.
    if (answerGridId === gameId) {
      return;
    }

    // Populate the answer grid from the target word.
    const newRow = targetWord.split("").map((ch) => ({
      char: ch,
      status: CellStatus.HIDDEN,
      animation: CellAnimation.NONE,
      animationDelay: 0,
    }));

    answerGrid.updateRow(0, newRow);
    setAnswerGridId(gameId);
  }, [targetWord, gameId, answerGridId]);

  const gameGridAnimationTracker = useAnimationTracker(
    (finishedMap) => {
      gameGrid.flushAnimation(finishedMap);
    },
    () => {
      if (gameState.pendingState != null) {
        updateGameState();
      }
    }
  );

  const answerGridAnimationTracker = useAnimationTracker((finishedMap) => {
    answerGrid.flushAnimation(finishedMap);
  });

  const isInputLocked =
    gameState.state !== GameState.PLAYING ||
    gameGridAnimationTracker.getCount() > 0 ||
    gameState.pendingState !== null;

  /**
   * Handles the completion of a single cell's animation in the main game grid.
   *
   * Marks the animation as finished and advances the cursor if all animations in the current row are completed.
   *
   * @param rowIndex - Index of the row of the animated cell.
   * @param colIndex - Index of the column of the animated cell.
   */
  const handleGameGridAnimationEnd = (
    rowIndex: number,
    colIndex: number
  ): void => {
    gameGridAnimationTracker.markEnd(rowIndex, colIndex);
    if (gameGridAnimationTracker.getCount() === 0)
      cursor.commitPendingRowAdvance();
  };

  /**
   * Handles the completion of a single cell's animation in the answer grid.
   *
   * Marks the animation as finished in the answer grid. Row index is ignored.
   *
   * @param rowIndex - Always 0 (ignored).
   * @param colIndex - Index of the column on the animated cell.
   */
  const handleAnswerGridAnimationEnd = (
    rowIndex: number,
    colIndex: number
  ): void => {
    rowIndex = 0;
    answerGridAnimationTracker.markEnd(rowIndex, colIndex);
  };

  /**
   * Applies the pending game state if one exists.
   *
   * Called after animations finish. Commits the pending game state and, if the game has ended. triggers revealing the answer grid.
   */
  const updateGameState = (): void => {
    const nextState = gameState.pendingState;
    const committed = gameState.commitState();
    if (!committed) return;

    if (nextState !== GameState.PLAYING) {
      revealAnswerGrid(nextState);
    }
  };

  /**
   * Reveals the target word on the answer grid.
   *
   * Animates each cell to indicate correctness depending on whether the game was won or lost.
   *
   * @param state - The final game state (WON or LOST).
   */
  const revealAnswerGrid = (state: GameState): void => {
    answerGridAnimationTracker.add(answerGrid.colNum);
    const revealedRow = answerGrid.renderGridRef.current[0].map((cell) => ({
      ...cell,
      status: state === GameState.WON ? CellStatus.CORRECT : CellStatus.WRONG,
      animation: CellAnimation.BOUNCE,
      animationDelay: 0,
      animationKey: (cell.animationKey ?? 0) + 1,
    }));
    answerGrid.updateRow(0, revealedRow);
  };

  /**
   * Handles guess submission.
   *
   * If the current row is incomplete, triggers an invalid-guess animation and shows a toast.
   * Otherwise, submits the guess for validation.
   */
  const handleSubmit = (): void => {
    if (cursor.col.current !== gameGrid.colNum) {
      addToast("Incomplete guess");
      gameGridAnimationTracker.add(gameGrid.colNum);
      gameGrid.applyInvalidGuessAnimation(
        cursor.row.current,
        animationSpeedMultiplier
      );
    } else submitGuess();
  };

  /**
   * Handles backspace input.
   *
   * Moves the cursor one position backward (if possible) and
   * clears the corresponding cell in the current row.
   */
  const handleBackspace = (): void => {
    const colToUpdate = cursor.retreatCol();
    if (colToUpdate === null) return;
    gameGrid.updateCell(cursor.row.current, colToUpdate, {
      char: "",
      status: CellStatus.DEFAULT,
      animation: CellAnimation.NONE,
      animationDelay: 0,
    });
  };

  /**
   * Handles a valid letter input.
   *
   * Advances the cursor and writes the letter into the current cell of the active row.
   *
   * @param letter - Uppercase letter to insert.
   */
  const handleLetter = (letter: string): void => {
    const colToUpdate = cursor.advanceCol(gameGrid.colNum);
    if (colToUpdate === null) return;
    gameGrid.updateCell(cursor.row.current, colToUpdate, {
      char: letter,
      status: CellStatus.DEFAULT,
      animation: CellAnimation.NONE,
      animationDelay: 0,
    });
  };

  /**
   * Handles a single keyboard input from the user.
   *
   * Updates the game grid based on letter input, backspace, or enter.
   * Plays key sounds and prevents input when locked or during animations.
   *
   * @param key - The pressed key (already capitalized).
   */
  const handleInput = (key: string): void => {
    if (!targetWord || isInputLocked) return;

    const isBackspace = key === "Backspace";
    const isEnter = key === "Enter";
    const isLetter = LETTER_REGEX.test(key);

    if (!isBackspace && !isEnter && !isLetter) return;

    playKeySound();

    if (isBackspace) return handleBackspace();
    else if (isEnter) return handleSubmit();
    else handleLetter(key);
  };

  /**
   * Resets the game to its initial state.
   *
   * Clears the game grid, answer grid, keyboard statuses, animations, toasts,
   * and reloads a new target word.
   */
  const restartGame = (): void => {
    gameState.resetState();
    cursor.resetCursor();

    resetKeyStatuses();

    incrementGameId();
    setAnswerGridId(null);

    resetTargetWord();

    reloadTargetWord();

    gameGrid.resetGrid();
    answerGrid.resetGrid();

    gameGridAnimationTracker.reset();
    answerGridAnimationTracker.reset();

    toastList.forEach((t) => removeToast(t.id));
  };

  /**
   * Handles a word validation error.
   *
   * Displays a toast notification and sets the validation error state.
   */
  const handleValidationError = (): void => {
    const message = "Error validating word. Please try again.";
    setValidationError(message);
    addToast(message);
  };

  const submitGuess = useGuessSubmission(
    animationSpeedMultiplier,
    targetLetterCount,
    targetWord,
    answerGrid,
    gameGrid,
    gameState,
    cursor,
    addToast,
    handleValidationError,
    setValidationError,
    updateKeyStatuses,
    gameGridAnimationTracker,
    answerGridAnimationTracker
  );

  useKeyboardInput(handleInput);

  return {
    gameGrid: {
      renderGrid: gameGrid.renderGrid,
      rowNum: gameGrid.rowNum,
      colNum: gameGrid.colNum,
      handleAnimationEnd: handleGameGridAnimationEnd,
    },

    answerGrid: {
      renderGrid: answerGrid.renderGrid,
      rowNum: answerGrid.rowNum,
      colNum: answerGrid.colNum,
      handleAnimationEnd: handleAnswerGridAnimationEnd,
    },

    keyboard: {
      statuses: keyStatuses,
      update: updateKeyStatuses,
      reset: resetKeyStatuses,
    },

    game: {
      gameState: gameState.state,
      validationError,
      wordFetchError,
      targetWord,
      restartGame,
    },

    toasts: {
      list: toastList,
      removeToast,
    },

    input: {
      handle: handleInput,
    },
  };
};
