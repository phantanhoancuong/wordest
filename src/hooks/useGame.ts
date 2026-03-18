"use client";

import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth/auth-client";

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

import { UseGameReturn } from "@/types/useGame.types";

import {
  useActiveSession,
  useAnimationTracker,
  useCursorController,
  useGameGrid,
  useGameState,
  useGuessSubmission,
  useKeyboardInput,
  useKeyStatuses,
  usePlayerStatsState,
  useReferenceRow,
  useSoundPlayer,
  useStrictConstraints,
  useToasts,
} from "@/hooks";

const LETTER_REGEX = /^[A-Z]$/;

/**
 * Core game hook that orchestrates all game logic and state management.
 *
 * Coordinates the game grid, reference row, keyboard input, animations, sound effects, and game state transitions.
 * Handles initialization, hydration from the server, input validation, guess submission, and game restart flow.
 *
 * On mount, fetch the current game state from the server
 * and hydrate all subsystems (grid, cursor, key statuses) before unlocking input.
 *
 * @returns Namespaced controllers for game grid, reference row, keyboard, game actions, toasts, input handling, and render state.
 */
export const useGame = (): UseGameReturn => {
  const activeSessionController = useActiveSession();
  const gameStateController = useGameState();
  const keyStatusesController = useKeyStatuses();
  const playerStatsController = usePlayerStatsState();
  const settingsContextController = useSettingsContext();
  const strictConstraintsController = useStrictConstraints();
  const toastsController = useToasts();

  const [serverError, setServerError] = useState<string>(null);

  const { data: session, isPending } = authClient.useSession();

  const gameGrid = useGameGrid(
    ATTEMPTS,
    settingsContextController.wordLength.value,
    CellStatus.DEFAULT,
    CellAnimation.NONE,
    0,
  );
  const referenceRow = useReferenceRow(
    settingsContextController.wordLength.value,
    CellStatus.DEFAULT,
    CellAnimation.NONE,
    0,
  );
  const gameGridAnimationTracker = useAnimationTracker(
    (finishedMap: Record<number, number[]>) => {
      gameGrid.flushAnimation(finishedMap);
    },
    () => {
      const state = activeSessionController.gameState;

      if (state === GameState.WON || state === GameState.LOST) {
        setIsReferenceRowRevealing(true);
        revealReferenceRow(state, targetWordRef.current);
      }

      if (state === GameState.WON) {
        playerStatsController.handleWon(
          activeSessionController.activeSession,
          settingsContextController.ruleset.value,
          settingsContextController.wordLength.value,
        );
      }

      if (state === GameState.LOST) {
        playerStatsController.handleLost(
          activeSessionController.activeSession,
          settingsContextController.ruleset.value,
          settingsContextController.wordLength.value,
        );
      }

      isInputLocked.current = false;
    },
  );
  const referenceRowAnimationTracker = useAnimationTracker(
    (finishedMap: Record<number, number[]>): void => {
      referenceRow.flushAnimation(finishedMap);
    },
  );
  /**
   * Handle the completion of a single cell's animation in the main game grid.
   *
   * Mark the cell animation as finished. When all cells in a row complete,
   * the animation tracker triggers post-animation logic (game state updates, stats recording, input unlock).
   *
   * @param rowIndex - Row index of the animated cell.
   * @param colIndex - Column index of the animated cell.
   */
  const handleGameGridAnimationEnd = (
    rowIndex: number,
    colIndex: number,
  ): void => {
    gameGridAnimationTracker.markEnd(rowIndex, colIndex);
  };
  /**
   * Handle the completion of a single cell's animation in the reference row.
   *
   * Mark the cell animation as finished in the reference row tracker.
   * The reference row is always a single row so rowIndex is normalized to 0.
   *
   * @param rowIndex - Always 0 (ignored).
   * @param colIndex - Index of the column of the animated cell.
   */
  const handleReferenceRowAnimationEnd = (colIndex: number): void => {
    const rowIndex = 0;
    referenceRowAnimationTracker.markEnd(rowIndex, colIndex);
  };
  /**
   * Reveal the reference row with bounce animations after game completion.
   *
   * Set all cells in the reference row to either CORRECT (win) or WRONG (loss)
   * and apply bounce animations.
   * Used to show the target word after the game ends.
   *
   * @param state - Final game state (WON or LOST) determining cell status.
   * @param targetWord - The target word to reveal (if available from server).
   **/
  const revealReferenceRow = (
    state: GameState,
    targetWord: string | null,
  ): void => {
    referenceRowAnimationTracker.add(referenceRow.colNum);
    const revealedRow = referenceRow.rowRef.current.map((cell, index) => ({
      ...cell,
      char: targetWord ? targetWord[index] : cell.char,
      status: state === GameState.WON ? CellStatus.CORRECT : CellStatus.WRONG,
      animation: CellAnimation.BOUNCE,
      animationDelay: 0,
      animationKey: (cell.animationKey ?? 0) + 1,
    }));

    referenceRow.applyRowAnimation(revealedRow);
  };

  const cursorController = useCursorController(
    gameGrid.rowNum,
    gameGrid.colNum,
  );

  /** Track whether client-side hydration from the server state is complete. */
  const [hasHydrated, setHasHydrated] = useState(false);

  /** Prevent user input during animations, API calls, or pre-hydration. */
  const isInputLocked = useRef(false);

  /** Store the target word when the game ends, for reveal after animations complete. */
  const targetWordRef = useRef<string | null>(null);
  /** Tracks whether the reference row reveal animation has started. */
  const [isReferenceRowRevealing, setIsReferenceRowRevealing] = useState(false);

  const animationSpeedMultiplier =
    AnimationSpeedMultiplier[settingsContextController.animationSpeed.value];
  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    settingsContextController.isMuted.value
      ? 0
      : settingsContextController.volume.value,
  );

  /**
   * Initialize practice game state on mount by fetching current session from the server.
   *
   * Lock input, request game data, hydrate grid/cursor/keyboard state,
   * then unlock input. Re-run when session type, ruleset, or word length changes.
   */
  useEffect(() => {
    if (activeSessionController.activeSession !== SessionType.PRACTICE) return;
    if (isPending || !session?.user) return;

    const initPracticeGame = async () => {
      setIsReferenceRowRevealing(false);
      targetWordRef.current = null;
      isInputLocked.current = true;
      try {
        const response = await fetch("/api/practice/hydrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ruleset: settingsContextController.ruleset.value,
            wordLength: settingsContextController.wordLength.value,
          }),
        });

        if (response.status === 500) {
          setServerError("Server error. Please reload or try again later.");
          return;
        }

        if (response.status === 400) {
          setServerError("Bad request. Please reload or try again later.");
          return;
        }

        if (!response.ok) {
          console.error("Unexpected error during restart:", response.status);
          setServerError(
            `Unexpected error (${response.status}). Please reload or try again later.`,
          );
        }

        const { data } = await response.json();
        // If no game is found, reset states to defaults.
        if (data === null) {
          gameGrid.resetGrid();
          referenceRow.resetRow();
          cursorController.resetCursor();
          keyStatusesController.resetKeyStatuses();
          strictConstraintsController.resetStrictConstraints();
          gameStateController.resetState();

          isInputLocked.current = false;
          setHasHydrated(true);
          return;
        }

        gameGrid.hydrateGrid(
          data.guesses,
          data.allStatuses,
          settingsContextController.wordLength.value,
        );
        referenceRow.hydrateRow(
          data.guesses,
          data.allStatuses,
          settingsContextController.wordLength.value,
          data.targetWord,
          data.gameState,
        );
        cursorController.hydrateCursor(data.guesses.length);
        keyStatusesController.hydrateKeyStatuses(
          data.guesses,
          data.allStatuses,
        );
        strictConstraintsController.syncStrictConstraints(
          data.lockedPositions,
          data.minimumLetterCounts,
        );
        gameStateController.setGameState(data.gameState);

        // If game is complete, set up reference row reveal state
        if (
          data.targetWord &&
          (data.gameState === GameState.WON ||
            data.gameState === GameState.LOST)
        ) {
          setIsReferenceRowRevealing(true);
          targetWordRef.current = data.targetWord;
        }

        isInputLocked.current = false;
        setHasHydrated(true);
      } catch (err) {
        console.error("Network error during game initialization:", err);
        setServerError(
          "Network error. Please check your connection and reload.",
        );
      }
    };

    initPracticeGame();
  }, [
    session?.user?.id,
    isPending,
    activeSessionController.activeSession,
    settingsContextController.ruleset.value,
    settingsContextController.wordLength.value,
  ]);

  /**
   * Initialize daily game state on mount by fetching current session from the server.
   *
   * Lock input, request game data, hydrate grid/cursor/keyboard state,
   * then unlock input. Re-run when session type, ruleset, or word length changes.
   */
  useEffect(() => {
    if (activeSessionController.activeSession !== SessionType.DAILY) return;
    if (isPending || !session?.user) return;

    const initDailyGame = async () => {
      setIsReferenceRowRevealing(false);
      targetWordRef.current = null;
      isInputLocked.current = true;
      try {
        const initGameResult = await fetch("/api/daily/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ruleset: settingsContextController.ruleset.value,
            wordLength: settingsContextController.wordLength.value,
          }),
        });

        if (!initGameResult.ok) {
          isInputLocked.current = false;
          return;
        }
        const initGameData = await initGameResult.json();

        gameGrid.hydrateGrid(
          initGameData.guesses,
          initGameData.allStatuses,
          settingsContextController.wordLength.value,
        );
        referenceRow.hydrateRow(
          initGameData.guesses,
          initGameData.allStatuses,
          settingsContextController.wordLength.value,
          initGameData.targetWord,
          initGameData.gameState,
        );
        cursorController.hydrateCursor(initGameData.guesses.length);
        keyStatusesController.hydrateKeyStatuses(
          initGameData.guesses,
          initGameData.allStatuses,
        );
        strictConstraintsController.syncStrictConstraints(
          initGameData.lockedPositions,
          initGameData.minimumLetterCounts,
        );
        gameStateController.setGameState(initGameData.gameState);

        // If game is complete, set up reference row reveal state
        if (
          initGameData.targetWord &&
          (initGameData.gameState === GameState.WON ||
            initGameData.gameState === GameState.LOST)
        ) {
          setIsReferenceRowRevealing(true);
          targetWordRef.current = initGameData.targetWord;
        }

        // Show new game message if applicable
        if (initGameData.message) {
          toastsController.addToast(initGameData.message);
        }

        isInputLocked.current = false;
        setHasHydrated(true);
      } catch (err) {
        console.error("Network error during game initialization.", err);
        isInputLocked.current = false;
      }
    };

    initDailyGame();
  }, [
    session?.user?.id,
    isPending,
    activeSessionController.activeSession,
    settingsContextController.ruleset.value,
    settingsContextController.wordLength.value,
  ]);

  const submitGuess = useGuessSubmission(
    settingsContextController.ruleset.value === Ruleset.STRICT ||
      settingsContextController.ruleset.value === Ruleset.HARDCORE,
    activeSessionController.activeSession,
    settingsContextController.ruleset.value,
    settingsContextController.wordLength.value,
    animationSpeedMultiplier,
    gameGrid,
    referenceRow,
    gameGridAnimationTracker,
    referenceRowAnimationTracker,
    cursorController,
    gameStateController,
    strictConstraintsController,
    toastsController.addToast,
    keyStatusesController.updateKeyStatuses,
    targetWordRef,
  );

  /** Route keyboard input to the appropriate handler.
   *
   * Ignore input when locked or game is not in PLAYING state.
   * Delegate to {@link handleBackspace}, {@link handleSubmit}, or {@link handleLetter}.
   *
   * @param key - Key string from the keyboard event.
   */
  const handleInput = (key: string): void => {
    if (
      isInputLocked.current ||
      gameStateController.state !== GameState.PLAYING
    )
      return;

    if (key === "Backspace") return handleBackspace();
    if (key === "Enter") {
      handleSubmit();
      return;
    }
    if (LETTER_REGEX.test(key)) return handleLetter(key);
  };
  /**
   * Handle backspace input by retreating the cursor and clearing the cell.
   *
   * Play key sound and reset the cell to default state.
   */
  const handleBackspace = (): void => {
    playKeySound();
    const colToUpdate = cursorController.retreatCol();
    if (colToUpdate === null) return;
    gameGrid.updateCell(cursorController.row.current, colToUpdate, {
      char: "",
      status: CellStatus.DEFAULT,
    });
  };
  /**
   * Handle letter input by advancing the cursor and inserting the character.
   *
   * Play key sound and update the cell with the new letter.
   *
   * @param letter - Single uppercase letter character (A-Z).
   */
  const handleLetter = (letter: string): void => {
    playKeySound();
    const colToUpdate = cursorController.advanceCol(gameGrid.colNum);
    if (colToUpdate === null) return;
    gameGrid.updateCell(cursorController.row.current, colToUpdate, {
      char: letter,
      status: CellStatus.DEFAULT,
    });
  };
  /**
   * Handle Enter key by locking input and submitting the current guess.
   *
   * Play key sound, lock input to prevent spam, and delegate validation and submission to {@link submitGuess}.
   */
  const handleSubmit = async (): Promise<void> => {
    playKeySound();
    isInputLocked.current = true;
    const { isServerError, message } = await submitGuess();
    if (isServerError === true && message !== null) {
      setServerError(message);
      isInputLocked.current = false;
      return;
    }
  };
  useKeyboardInput(handleInput);

  /**
   * Restart the current game by fetching a new word from the server.
   *
   * Only allowed when the game is not in PLAYING state.
   * Lock input, request a new game, reset all subsystems (grid, cursor, keyboard, constraints, toasts), then unlock input.
   */
  const restartGame = async () => {
    if (gameStateController.state === GameState.PLAYING) {
      toastsController.addToast("Game's not done. Cannot restart.");
      return;
    }

    isInputLocked.current = true;
    try {
      const response = await fetch("/api/practice/restart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruleset: settingsContextController.ruleset.value,
          wordLength: settingsContextController.wordLength.value,
        }),
      });

      if (response.status === 500) {
        setServerError("Server error. Please reload or try again later.");
        return;
      }

      if (response.status === 400) {
        setServerError("Bad request. Please reload or try again later");
        return;
      }

      if (response.status === 422) {
        const { message } = await response.json();
        toastsController.addToast(message);
        isInputLocked.current = false;
        return;
      }

      if (!response.ok) {
        console.error("Unexpected error during restart:", response.status);
        setServerError(
          `Unexpected error (${response.status}). Please reload or try again later.`,
        );
      }

      gameStateController.resetState();

      cursorController.resetCursor();

      keyStatusesController.resetKeyStatuses();

      gameGrid.resetGrid();
      referenceRow.resetRow();
      gameGridAnimationTracker.reset();
      referenceRowAnimationTracker.reset();

      strictConstraintsController.resetStrictConstraints();

      targetWordRef.current = null;
      setIsReferenceRowRevealing(false);

      toastsController.toastList.forEach((t) =>
        toastsController.removeToast(t.id),
      );
      toastsController.addToast("Game restarted!");

      isInputLocked.current = false;
    } catch (err) {
      console.error("Network error during restart:", err);
      setServerError("Network error. Please check your connection and reload.");
    }
  };

  return {
    gameGrid: {
      grid: gameGrid.grid,
      rowNum: gameGrid.rowNum,
      colNum: gameGrid.colNum,
      handleAnimationEnd: handleGameGridAnimationEnd,
    },

    referenceRow: {
      row: referenceRow.row,
      colNum: referenceRow.colNum,
      handleAnimationEnd: handleReferenceRowAnimationEnd,
      isRevealing: isReferenceRowRevealing,
    },

    keyboard: {
      statuses: keyStatusesController.keyStatuses,
      update: keyStatusesController.updateKeyStatuses,
      reset: keyStatusesController.resetKeyStatuses,
    },

    game: {
      gameState: gameStateController.state,
      restartGame,
    },

    toasts: {
      list: toastsController.toastList,
      addToast: toastsController.addToast,
      removeToast: toastsController.removeToast,
    },

    input: {
      handle: handleInput,
    },

    render: {
      hasHydrated,
      serverError,
    },
  };
};
