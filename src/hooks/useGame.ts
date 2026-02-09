import { useEffect, useRef, useState } from "react";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import {
  ATTEMPTS,
  AnimationSpeedMultiplier,
  CellAnimation,
  CellStatus,
  GameState,
  Ruleset,
} from "@/lib/constants";
import { DataCell } from "@/types/cell";
import { UseGameReturn } from "@/types/useGame.types";

import { useActiveSession } from "@/hooks/useActiveSession";
import { useAnimationTracker } from "@/hooks/useAnimationTracker";
import { useCursorController } from "@/hooks/useCursorController";
import { useDailySnapshotState } from "@/hooks/useDailySnapshotState";
import { useGameState } from "@/hooks/useGameState";
import { useGridState } from "@/hooks/useGridState";
import { useGuessSubmission } from "@/hooks/useGuessSubmission";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useKeyStatuses } from "@/hooks/useKeyStatuses";
import { useSoundPlayer } from "@/hooks/useSoundPlayer";
import { useStrictConstraints } from "@/hooks/useStrictConstraints";
import { useTargetWord } from "@/hooks/useTargetWord";
import { useToasts } from "@/hooks/useToasts";

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
  /**
   * Controller for reading/resetting/loading the target word.
   * It reads the target word first from the global game store but it can be overridden.
   */
  const targetWordController = useTargetWord();
  /** Game state managing hook (PLAYING, WON, LOST). */
  const gameState = useGameState();
  /** Cursor position managing hook. */
  const cursor = useCursorController();

  const activeSessionController = useActiveSession();

  const [validationError, setValidationError] = useState("");
  const toastsController = useToasts();
  const keyStatusesController = useKeyStatuses();
  const { volume, animationSpeed, isMuted, ruleset, wordLength } =
    useSettingsContext();

  const animationSpeedMultiplier =
    AnimationSpeedMultiplier[animationSpeed.value];

  /** Main game grid state, persisted by the game store. */
  const gameGrid = useGridState(
    ATTEMPTS,
    wordLength.value,
    CellStatus.DEFAULT,
    CellAnimation.NONE,
    0,
    activeSessionController.gameGrid,
    activeSessionController.setGameGrid,
    activeSessionController.resetGameGrid,
  );
  /** Reference grid that helps the user accumulate clues and show the target word, persisted by the game store. */
  const referenceGrid = useGridState(
    1,
    wordLength.value,
    CellStatus.HIDDEN,
    CellAnimation.NONE,
    0,
    activeSessionController.referenceGrid,
    activeSessionController.setReferenceGrid,
    activeSessionController.resetReferenceGrid,
  );

  const strictConstraints = useStrictConstraints();

  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    isMuted.value ? 0 : volume.value,
  );

  /**
   * Tracks per-cell animations for the main game grid.
   * When all animations finish, input is unlocked and any pending state is committed.
   */
  const gameGridAnimationTracker = useAnimationTracker(
    (finishedMap) => {
      gameGrid.flushAnimation(finishedMap);
    },
    () => {
      isInputLocked.current = false;
      if (gameState.pendingState != null) {
        updateGameState();
      }
    },
  );

  /** Tracks per-cell animations for the reference grid and flushes them when finished. */
  const referenceGridAnimationTracker = useAnimationTracker((finishedMap) => {
    referenceGrid.flushAnimation(finishedMap);
  });

  /**
   * Initialize the reference grid according to the fetched target word.
   */
  const populateReferenceGrid = (word: string) => {
    const newRow: DataCell[] = word.split("").map((ch) => ({
      char: ch,
      status: CellStatus.HIDDEN,
    }));
    referenceGrid.updateRow(0, newRow);
  };

  const [hasHydrated, setHasHydrated] = useState(false);

  /**
   * Fully (re)initializes the game as a brand new game.
   * - Locks input.
   * - Resets game state, cursor, key statuses, grids, animations, toasts, and constraints.
   * - Clears the current target word.
   * - Fetches a new target word.
   * - Populates the reference grid with the new word.
   * - Unlocks input when ready.
   *
   * This should ONLY be called when creating a new game.
   */
  const initGame = async () => {
    isInputLocked.current = true;
    gameState.resetState();
    cursor.resetCursor();

    keyStatusesController.resetKeyStatuses();

    gameGrid.resetGrid();
    referenceGrid.resetGrid();

    gameGridAnimationTracker.reset();
    referenceGridAnimationTracker.reset();

    toastsController.toastList.forEach((t) =>
      toastsController.removeToast(t.id),
    );

    targetWordController.resetTargetWord();

    strictConstraints.resetStrictConstraints();

    const word = await targetWordController.loadTargetWord(
      wordLength.value,
      activeSessionController.activeSession,
      ruleset.value,
    );

    if (!word) return;

    populateReferenceGrid(word);

    isInputLocked.current = false;
  };

  /** Fully restarts the game.
   *
   * This is a wrapper for 'initGame(true)'.
   */
  const restartGame = async () => {
    await initGame();
  };

  const dailySnapshotState = useDailySnapshotState();

  // Initialize the game
  useEffect(() => {
    // The game will need restarting if the word length or ruleset value has changed.
    const needsRestart = activeSessionController.hydrateFromSettings(
      ruleset.value,
      wordLength.value,
    );
    // Mark client as hydrated to render
    setHasHydrated(true);

    // If word length or ruleset has changed or there's no target word, start a new game.
    if (needsRestart || !targetWordController.targetWord) {
      initGame();
    }
    isInputLocked.current = false;
  }, []);

  const isInputLocked = useRef(true);

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
    colIndex: number,
  ): void => {
    gameGridAnimationTracker.markEnd(rowIndex, colIndex);
    if (gameGridAnimationTracker.getCount() === 0)
      cursor.commitPendingRowAdvance();
  };

  /**
   * Handles the completion of a single cell's animation in the reference grid.
   *
   * Marks the animation as finished in the reference grid. Row index is ignored.
   *
   * @param rowIndex - Always 0 (ignored).
   * @param colIndex - Index of the column on the animated cell.
   */
  const handleReferenceGridAnimationEnd = (
    rowIndex: number,
    colIndex: number,
  ): void => {
    rowIndex = 0;
    referenceGridAnimationTracker.markEnd(rowIndex, colIndex);
  };

  /**
   * Applies the pending game state if one exists.
   *
   * Called after animations finish. Commits the pending game state and, if the game has ended. triggers revealing the reference grid.
   */
  const updateGameState = (): void => {
    const nextState = gameState.pendingState;
    const committed = gameState.commitState();
    if (!committed) return;

    if (nextState !== GameState.PLAYING) {
      revealReferenceGrid(nextState);
    }

    isInputLocked.current = false;
  };

  /**
   * Reveals the target word on the reference grid.
   *
   * Animates each cell to indicate correctness depending on whether the game was won or lost.
   *
   * @param state - The final game state (WON or LOST).
   */
  const revealReferenceGrid = (state: GameState): void => {
    referenceGridAnimationTracker.add(referenceGrid.colNum);
    const revealedRow = referenceGrid.renderGridRef.current[0].map((cell) => ({
      ...cell,
      status: state === GameState.WON ? CellStatus.CORRECT : CellStatus.WRONG,
      animation: CellAnimation.BOUNCE,
      animationDelay: 0,
      animationKey: (cell.animationKey ?? 0) + 1,
    }));
    referenceGrid.applyRowAnimation(0, revealedRow);
  };

  /**
   * Handles Enter key press for guess submission.
   */
  const handleSubmit = (): void => {
    isInputLocked.current = true;
    submitGuess();
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
    if (
      !targetWordController.targetWord ||
      isInputLocked.current ||
      gameState.state !== GameState.PLAYING
    )
      return;

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
   * Handles a word validation error.
   *
   * Displays a toast notification and sets the validation error state.
   */
  const handleValidationError = (): void => {
    const message = "Error validating word. Please try again.";
    setValidationError(message);
    toastsController.addToast(message);
  };

  const submitGuess = useGuessSubmission(
    ruleset.value === Ruleset.STRICT || ruleset.value === Ruleset.HARDCORE,
    animationSpeedMultiplier,
    targetWordController.targetLetterCount,
    targetWordController.targetWord,
    referenceGrid,
    gameGrid,
    gameState,
    cursor,
    gameGridAnimationTracker,
    referenceGridAnimationTracker,
    strictConstraints,
    toastsController.addToast,
    handleValidationError,
    setValidationError,
    keyStatusesController.updateKeyStatuses,
  );

  useKeyboardInput(handleInput);

  return {
    gameGrid: {
      renderGrid: gameGrid.renderGrid,
      rowNum: gameGrid.rowNum,
      colNum: gameGrid.colNum,
      handleAnimationEnd: handleGameGridAnimationEnd,
    },

    referenceGrid: {
      renderGrid: referenceGrid.renderGrid,
      rowNum: referenceGrid.rowNum,
      colNum: referenceGrid.colNum,
      handleAnimationEnd: handleReferenceGridAnimationEnd,
    },

    keyboard: {
      statuses: keyStatusesController.keyStatuses,
      update: keyStatusesController.updateKeyStatuses,
      reset: keyStatusesController.resetKeyStatuses,
    },

    game: {
      gameState: gameState.state,
      validationError,
      wordFetchError: targetWordController.wordFetchError,
      targetWord: targetWordController.targetWord,
      restartGame,
    },

    toasts: {
      list: toastsController.toastList,
      removeToast: toastsController.removeToast,
    },

    input: {
      handle: handleInput,
    },

    render: {
      hasHydrated,
    },
  };
};
