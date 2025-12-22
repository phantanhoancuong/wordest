import { useEffect, useMemo, useRef, useState } from "react";

import {
  ATTEMPTS,
  WORD_LENGTH,
  AnimationSpeedMultiplier,
  CellAnimation,
  CellStatus,
  GameState,
} from "@/lib/constants";

import { useAnimationTracker } from "./useAnimationTracker";
import { useCursorController } from "./useCursorController";
import { useGameState } from "./useGameState";
import { useGridState } from "./useGridState";
import { useGuessSubmission } from "./useGuessSubmission";
import { useKeyboardInput } from "./useKeyboardInput";
import { useKeyStatuses } from "./useKeyStatuses";
import { useSoundPlayer } from "./useSoundPlayer";
import { useTargetWord } from "./useTargetWord";
import { useToasts } from "./useToasts";

import { UseGameReturn } from "@/types/useGame.types";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

/**
 * Hook to manage the state and logic of the game.
 *
 * Tracks the grid of guesses, keyboard statuses, game state, toasts, input handling, and sound playback.
 *
 * @returns Game controller and associated utilities.
 */
export const useGame = (): UseGameReturn => {
  const { targetWord, targetLetterCount, wordFetchError, reloadTargetWord } =
    useTargetWord();

  const gameState = useGameState();
  const cursor = useCursorController();

  const inputLocked = useRef(false);
  const [validationError, setValidationError] = useState("");
  const { toastList, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();
  const { volume, animationSpeed, isMuted } = useSettingsContext();

  const animationSpeedMultiplier =
    AnimationSpeedMultiplier[animationSpeed.value];

  const gameGrid = useGridState(
    ATTEMPTS,
    WORD_LENGTH,
    CellStatus.DEFAULT,
    CellAnimation.NONE,
    0
  );

  const answerGrid = useGridState(
    1,
    WORD_LENGTH,
    CellStatus.HIDDEN,
    CellAnimation.NONE,
    0
  );

  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    isMuted ? 0 : volume.value
  );

  const updateAnswerGrid = useMemo(() => {
    if (!targetWord) return () => answerGrid.resetGrid();
    const newRow = targetWord.split("").map((ch) => ({
      char: ch,
      status: CellStatus.HIDDEN,
      animation: CellAnimation.NONE,
      animationDelay: 0,
    }));
    return () => answerGrid.updateRow(0, newRow);
  }, [targetWord]);

  useEffect(() => updateAnswerGrid(), [updateAnswerGrid]);

  const gameGridAnimationTracker = useAnimationTracker(
    (finishedMap) => {
      gameGrid.flushAnimation(finishedMap);
    },
    () => {
      inputLocked.current = false;
      if (gameState.pendingState != null) {
        updateGameState();
      }
    }
  );

  const answerGridAnimationTracker = useAnimationTracker((finishedMap) => {
    answerGrid.flushAnimation(finishedMap);
  });

  /**
   * Handles the cell's data at the end of its animation.
   *
   * Decrements the active animation counter, clears finished animations when all have ended,
   * and advances to the next row if needed.
   *
   * @param rowIndex - The row index of the animated cell.
   * @param colIndex - The column index of the animated cell.
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
   * Handles the cell's data at the end of its animation.
   *
   * Decrements the active animation counter and
   * clears finished animations when all have ended,
   *
   * @param rowIndex - Always 0 (ignored).
   * @param colIndex - The column index of the animated cell.
   */
  const handleAnswerGridAnimationEnd = (rowIndex: number, colIndex: number) => {
    rowIndex = 0;
    answerGridAnimationTracker.markEnd(rowIndex, colIndex);
  };

  /**
   * Applies the pending game state (if any).
   *
   * - Called when cell animations finish.
   * - Updates the main `gameState` and clears the pending ref.
   */
  const updateGameState = (): void => {
    const nextState = gameState.pendingState;
    const committed = gameState.commitState();
    if (!committed) return;

    if (nextState !== GameState.PLAYING) {
      revealAnswerGrid(nextState);
    }
  };

  const revealAnswerGrid = (state: GameState) => {
    requestAnimationFrame(() => {
      answerGridAnimationTracker.add(answerGrid.colNum);

      const revealedRow = answerGrid.gridRef.current[0].map((cell, i) => ({
        ...cell,
        status: state === GameState.WON ? CellStatus.CORRECT : CellStatus.WRONG,
        animation: CellAnimation.BOUNCE,
        animationDelay: 0,
        animationKey: (cell.animationKey ?? 0) + 1,
      }));

      answerGrid.updateRow(0, revealedRow);
    });
  };

  /**
   * Resets all game states, grid, keyboard, and target word to start a new game.
   */
  const restartGame = (): void => {
    gameState.resetState();
    cursor.resetCursor();

    resetKeyStatuses();
    reloadTargetWord();

    gameGrid.resetGrid();
    answerGrid.resetGrid();
    gameGridAnimationTracker.reset();
    answerGridAnimationTracker.reset();

    inputLocked.current = false;

    toastList.forEach((t) => removeToast(t.id));
  };

  /**
   * Handles keyboard input for the game.
   *
   * @param key - The key pressed by the user.
   */
  const handleInput = (key: string): void => {
    if (
      gameState.state !== GameState.PLAYING ||
      !targetWord ||
      gameGridAnimationTracker.getCount() > 0 ||
      inputLocked.current
    )
      return;

    const isLetter = /^[A-Z]$/.test(key);
    const isBackspace = key === "Backspace";
    const isEnter = key === "Enter";

    if (isLetter || isBackspace || isEnter) {
      playKeySound();
    }

    if (isBackspace) {
      const colToUpdate = cursor.retreatCol();
      if (colToUpdate === null) return;
      gameGrid.updateCell(cursor.row.current, colToUpdate, {
        char: "",
        status: CellStatus.DEFAULT,
        animation: CellAnimation.NONE,
        animationDelay: 0,
      });
      return;
    }

    if (isEnter) {
      if (cursor.col.current === gameGrid.colNum) submitGuess();
      return;
    }

    if (isLetter) {
      const letter = key.toUpperCase();
      const colToUpdate = cursor.advanceCol(gameGrid.colNum);
      if (colToUpdate === null) return;
      gameGrid.updateCell(cursor.row.current, colToUpdate, {
        char: letter,
        status: CellStatus.DEFAULT,
        animation: CellAnimation.NONE,
        animationDelay: 0,
      });
    }
  };

  /**
   * Handles a general validation error.
   */
  const handleValidationError = (): void => {
    const message = "Error validating word. Please try again.";
    setValidationError(message);
    addToast(message);
  };

  const submitGuess = useGuessSubmission(
    animationSpeedMultiplier,
    inputLocked,
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
      data: gameGrid.grid,
      rowNum: gameGrid.rowNum,
      colNum: gameGrid.colNum,
      handleAnimationEnd: handleGameGridAnimationEnd,
    },

    answerGrid: {
      data: answerGrid.grid,
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
