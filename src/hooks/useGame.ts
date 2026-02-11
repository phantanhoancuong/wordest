import { useEffect, useRef, useState } from "react";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import {
  ATTEMPTS,
  AnimationSpeedMultiplier,
  CellAnimation,
  CellStatus,
  GameState,
  Ruleset,
  SessionType,
} from "@/lib/constants";

import { DataCell } from "@/types/cell";
import { UseGameReturn } from "@/types/useGame.types";

import {
  useActiveSession,
  useAnimationTracker,
  useCursorController,
  useDailySnapshotState,
  useGameState,
  useGridState,
  useGuessSubmission,
  useKeyboardInput,
  useKeyStatuses,
  useSoundPlayer,
  useStrictConstraints,
  useTargetWord,
  useToasts,
} from "@/hooks";

/** Matches a single uppercase character, used to validate keyboard letter input. */
const LETTER_REGEX = /^[A-Z]$/;

/**
 * Main game hook.
 *
 * Coordinates:
 * - Grid states (game grid and reference grid).
 * - Keyboard state.
 * - Cursor movement.
 * - Game state transitions.
 * - Animations.
 * - Input handling.
 * - Toasts and sound effects.
 * - Session persistence (DAILY / PRACTICE).
 *
 * @returns Game controller and UI-facing state.
 */
export const useGame = (): UseGameReturn => {
  /** Whether the hook has hydrated all of its components to display yet. */
  const [hasHydrated, setHasHydrated] = useState(false);
  /** Last validation error message. */
  const [validationError, setValidationError] = useState("");
  /** Keeps track of the last hydrated snapshot to avoid duplicate hydration.  */
  const lastHydratedKeyRef = useRef<string | null>(null);
  /** Ref used to block user input during animations. */
  const isInputLocked = useRef(true);

  /**
   * Controller for reading/resetting/loading the target word.
   * The word may come from the global store or be freshly fetched.
   */
  const targetWordController = useTargetWord();
  /** Game state managing hook (PLAYING, WON, LOST), with pending transitions. */
  const gameState = useGameState();
  /** Cursor position managing hook (row/column of the current input). */
  const cursor = useCursorController();
  /** Active session controller (DAILY, PRACTICE) and persisted session state.*/
  const activeSessionController = useActiveSession();
  /** Toast notifications controller. */
  const toastsController = useToasts();
  /** Keyboard key statuses controller (CORRECT, PRESENT, ABSENT, etc.). */
  const keyStatusesController = useKeyStatuses();
  /** Persisted user settings in localStorage. */
  const settingsContext = useSettingsContext();

  /** Convert user animation speed settings into a numeric multiplier. */
  const animationSpeedMultiplier =
    AnimationSpeedMultiplier[settingsContext.animationSpeed.value];

  /**
   * Main game grid state (the guesses grid).
   * This is persisted in the active session store.
   */
  const gameGrid = useGridState(
    ATTEMPTS,
    settingsContext.wordLength.value,
    CellStatus.DEFAULT,
    CellAnimation.NONE,
    0,
    activeSessionController.gameGrid,
    activeSessionController.setGameGrid,
    activeSessionController.resetGameGrid,
  );

  /**
   * Reference grid state (the target word row shown at the bottom).
   * This is persisted in the active session store.
   */
  const referenceGrid = useGridState(
    1,
    settingsContext.wordLength.value,
    CellStatus.HIDDEN,
    CellAnimation.NONE,
    0,
    activeSessionController.referenceGrid,
    activeSessionController.setReferenceGrid,
    activeSessionController.resetReferenceGrid,
  );

  /** Enforces strict/hardcore constraints across guesses. */
  const strictConstraints = useStrictConstraints();

  /** Plays key press sounds (disabled when muted or volume is zero). */
  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    settingsContext.isMuted.value ? 0 : settingsContext.volume.value,
  );

  /**
   * Tracks per-cell animations for the main game grid.
   *
   * - When animations finish, we reset animation data from the renderGrid.
   * - When all animations in a batch finish, we unlock input and commit any pending game state.
   */
  const gameGridAnimationTracker = useAnimationTracker(
    (finishedMap: Record<number, number[]>): void => {
      gameGrid.flushAnimation(finishedMap);
    },
    () => {
      isInputLocked.current = false;
      if (gameState.pendingState != null) {
        updateGameState();
      }
    },
  );

  /**
   * Tracks per-cell animations for the reference grid.
   *
   * - When animations finish, we reset animation data from the renderGrid.
   */ const referenceGridAnimationTracker = useAnimationTracker(
    (finishedMap: Record<number, number[]>): void => {
      referenceGrid.flushAnimation(finishedMap);
    },
  );

  /**
   * Populates the reference grid with the target word.
   * Each character starts hidden and will be revealed at game end
   * or when the player guesses a correct letter in the correct position.
   *
   * @param word - The guessed word.
   */
  const populateReferenceGrid = (word: string): void => {
    const newRow: DataCell[] = word.split("").map((ch) => ({
      char: ch,
      status: CellStatus.HIDDEN,
    }));
    referenceGrid.updateRow(0, newRow);
  };

  /**
   * Fully (re)initializes the game as a brand new game.
   *
   * Steps:
   * - Locks input.
   * - Resets game state, cursor, key statuses, grids, animations, toasts, and constraints.
   * - Clears the current target word.
   * - Fetches a new target word.
   * - Populates the reference grid with the new word.
   * - Unlocks input when ready.
   *
   * This should ONLY be called when creating a new game, not when restoring from snapshot,
   * or resuming from the game state.
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
      settingsContext.wordLength.value,
      activeSessionController.activeSession,
      settingsContext.ruleset.value,
    );

    if (!word) return;

    populateReferenceGrid(word);

    isInputLocked.current = false;
  };

  /** Daily snapshot persistence controller (localStorage-backed). */
  const dailySnapshotState = useDailySnapshotState();

  /** Current snapshot for a given (ruleset, wordLength) combination if there's any. */
  const snapshot = dailySnapshotState.getSnapshot(
    settingsContext.ruleset.value,
    settingsContext.wordLength.value,
  );

  /** Stable key used to detect when a different snapshot should be hydratead. */
  const snapshotKey = snapshot
    ? `${dailySnapshotState.todayIndex}:${settingsContext.ruleset.value}:${settingsContext.wordLength.value}`
    : null;

  /**
   * Ensures that a snapshot exists whenever we are in DAILY mode and the (ruleset, wordLength) combination changes.
   */
  useEffect(() => {
    if (activeSessionController.activeSession !== SessionType.DAILY) return;
    dailySnapshotState.ensureSnapshot(
      settingsContext.ruleset.value,
      settingsContext.wordLength.value,
    );
  }, [
    activeSessionController.activeSession,
    settingsContext.ruleset.value,
    settingsContext.wordLength.value,
  ]);

  /**
   * Hydrate session state from the daily snapshot.
   * This runs when the snapshot key changes (new day, ruleset, or word length);
   */
  useEffect(() => {
    if (activeSessionController.activeSession !== SessionType.DAILY) return;
    if (!snapshot || !snapshotKey) return;
    if (lastHydratedKeyRef.current === snapshotKey) return;

    lastHydratedKeyRef.current = snapshotKey;

    (async () => {
      isInputLocked.current = true;
      setHasHydrated(false);

      // Load target word for DAILY (should be stable for the day).
      const word = await targetWordController.loadTargetWord(
        settingsContext.wordLength.value,
        SessionType.DAILY,
        settingsContext.ruleset.value,
      );

      activeSessionController.setRuleset(settingsContext.ruleset.value);
      activeSessionController.setWordLength(settingsContext.wordLength.value);

      // Hydrate session state from snapshot.
      activeSessionController.hydrateFromSnapshot(snapshot);

      // If this snapshot was just created, initialize reference grid.
      if (snapshot.isNew && word) populateReferenceGrid(word);

      setHasHydrated(true);
      isInputLocked.current = false;
    })();
  }, [
    activeSessionController.activeSession,
    snapshotKey,
    settingsContext.ruleset.value,
    settingsContext.wordLength.value,
  ]);

  /** Handles PRACTICE mode initialize and restarts when (ruleset, word length) combination changes. */
  useEffect(() => {
    if (activeSessionController.activeSession !== SessionType.PRACTICE) return;

    setHasHydrated(false);
    let needsRestart = false;

    // Sunc ruleset and word length into session state.
    if (settingsContext.ruleset.value !== activeSessionController.ruleset) {
      needsRestart = true;
      activeSessionController.setRuleset(settingsContext.ruleset.value);
    }
    if (
      settingsContext.wordLength.value !== activeSessionController.wordLength
    ) {
      needsRestart = true;
      activeSessionController.setWordLength(settingsContext.wordLength.value);
    }

    // Start a new game if needed or if there is not target word yet.
    if (targetWordController.targetWord === null || needsRestart) {
      initGame();
    }

    setHasHydrated(true);
    isInputLocked.current = false;
  }, [
    activeSessionController.activeSession,
    settingsContext.ruleset.value,
    settingsContext.wordLength.value,
  ]);

  /** Persist DAILY session state into the snapshot whenever relevant. */
  useEffect(() => {
    if (
      activeSessionController.activeSession === SessionType.PRACTICE ||
      !hasHydrated ||
      !snapshot
    )
      return;

    dailySnapshotState.updateSnapshot(
      settingsContext.ruleset.value,
      settingsContext.wordLength.value,
      {
        gameGrid: activeSessionController.gameGrid,
        referenceGrid: activeSessionController.referenceGrid,
        row: activeSessionController.row,
        col: activeSessionController.col,
        gameState: activeSessionController.gameState,
        keyStatuses: activeSessionController.keyStatuses,
        minimumLetterCounts: activeSessionController.minimumLetterCounts,
        lockedPositions: activeSessionController.lockedPositions,
      },
    );
  }, [
    hasHydrated,
    activeSessionController.activeSession,
    activeSessionController.gameGrid,
    activeSessionController.referenceGrid,
    activeSessionController.row,
    activeSessionController.col,
    activeSessionController.gameState,
    activeSessionController.keyStatuses,
    activeSessionController.minimumLetterCounts,
    activeSessionController.lockedPositions,
    settingsContext.ruleset.value,
    settingsContext.wordLength.value,
  ]);

  /**
   * Handles the completion of a single cell's animation in the main game grid.
   *
   * Marks the animation as finished and advances the cursor if all animations in the current row are completed.
   *
   * @param rowIndex - Row index of the animated cell.
   * @param colIndex - Column index of the animated cell.
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
    settingsContext.ruleset.value === Ruleset.STRICT ||
      settingsContext.ruleset.value === Ruleset.HARDCORE,
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

  /** Attaches global keyboard input listener. */
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
      restartGame: initGame,
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
