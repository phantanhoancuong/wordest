import { useEffect, useRef, useState } from "react";

import { useSettingsContext } from "@/app/contexts/SettingsContext";
import { useGameStore } from "@/store/useGameStore";

import {
  ATTEMPTS,
  AnimationSpeedMultiplier,
  CellAnimation,
  CellStatus,
  GameState,
  Ruleset,
} from "@/lib/constants";
import { UseGameReturn } from "@/types/useGame.types";

import { useAnimationTracker } from "@/hooks/useAnimationTracker";
import { useCursorController } from "@/hooks/useCursorController";
import { useStrictConstraints } from "@/hooks/useStrictConstraints";
import { useGameState } from "@/hooks/useGameState";
import { useGridState } from "@/hooks/useGridState";
import { useGuessSubmission } from "@/hooks/useGuessSubmission";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useKeyStatuses } from "@/hooks/useKeyStatuses";
import { useSoundPlayer } from "@/hooks/useSoundPlayer";
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
  const targetWordController = useTargetWord();

  const gameState = useGameState();
  const cursor = useCursorController();

  const [validationError, setValidationError] = useState("");
  const { toastList, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();
  const { volume, animationSpeed, isMuted, ruleset, wordLength } =
    useSettingsContext();

  const animationSpeedMultiplier =
    AnimationSpeedMultiplier[animationSpeed.value];

  const activeSession = useGameStore((s) => s.activeSession);

  const dataGameGrid = useGameStore(
    (s) => s.sessions.get(activeSession).gameGrid,
  );
  const setDataGameGrid = useGameStore((s) => s.setGameGrid);
  const resetDataGameGrid = useGameStore((s) => s.resetGameGrid);
  const dataReferenceGrid = useGameStore(
    (s) => s.sessions.get(activeSession).referenceGrid,
  );
  const setDataReferenceGrid = useGameStore((s) => s.setReferenceGrid);
  const resetDataReferenceGrid = useGameStore((s) => s.resetReferenceGrid);
  const wordLengthStore = useGameStore(
    (s) => s.sessions.get(s.activeSession).wordLength,
  );
  const setWordLengthStore = useGameStore((s) => s.setWordLength);

  const gameGrid = useGridState(
    ATTEMPTS,
    wordLength.value,
    CellStatus.DEFAULT,
    CellAnimation.NONE,
    0,
    dataGameGrid,
    setDataGameGrid,
    resetDataGameGrid,
  );

  const referenceGrid = useGridState(
    1,
    wordLength.value,
    CellStatus.HIDDEN,
    CellAnimation.NONE,
    0,
    dataReferenceGrid,
    setDataReferenceGrid,
    resetDataReferenceGrid,
  );

  const strictConstraints = useStrictConstraints();

  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    isMuted.value ? 0 : volume.value,
  );

  const rulesetStore = useGameStore(
    (s) => s.sessions.get(activeSession).ruleset,
  );
  const setRulesetStore = useGameStore((s) => s.setRuleset);

  const gameId = useGameStore((s) => s.sessions.get(activeSession).gameId);
  const incrementGameId = useGameStore((s) => s.incrementGameId);
  const referenceGridId = useGameStore(
    (s) => s.sessions.get(activeSession).referenceGridId,
  );
  const setReferenceGridId = useGameStore((s) => s.setReferenceGridId);

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

  /**
   * Initialize the reference grid according to the fetched target word.
   */
  const populateReferenceGrid = (word: string) => {
    const newRow = word.split("").map((ch) => ({
      char: ch,
      status: CellStatus.HIDDEN,
      animation: CellAnimation.NONE,
      animationDelay: 0,
    }));
    referenceGrid.updateRow(0, newRow);
  };

  const [hasHydrated, setHasHydrated] = useState(false);

  /**
   * Initializes the game state and UI.
   *
   * Resets states (cursor, animations, key statuses, grids, toasts, and strict constraints),
   * optionally increments the game ID, and (re)loads the target word based on the current settings.
   *
   * When 'restart' is true, this is treated as a full restart:
   * - Increments the game ID.
   * - Clears the reference grid Id so a new target word is fetched and rendered.
   *
   * When 'restart' is false, perform a soft re-initialization:
   * - Resets UI and state without incrementing the game ID.
   * - Used when hydrating or re-syncing an existing session.
   * @param restart - Whether to perform a full restart or not.
   */
  const initGame = async (restart: boolean = false) => {
    isInputLocked.current = true;
    gameState.resetState();
    cursor.resetCursor();

    resetKeyStatuses();
    let newGameId = gameId;
    if (restart) {
      newGameId = incrementGameId();
      setReferenceGridId(null);
    }

    gameGrid.resetGrid();
    referenceGrid.resetGrid();

    gameGridAnimationTracker.reset();
    referenceGridAnimationTracker.reset();

    toastList.forEach((t) => removeToast(t.id));

    targetWordController.resetTargetWord();

    strictConstraints.resetStrictConstraints();

    const word = await targetWordController.loadTargetWord(
      wordLength.value,
      activeSession,
      ruleset.value,
    );

    if (!word) return;

    populateReferenceGrid(word);
    setReferenceGridId(newGameId);

    isInputLocked.current = false;
  };

  /** Fully restarts the game.
   *
   * This is a wrapper for 'initGame(true)'.
   */
  const restartGame = async () => {
    await initGame(true);
  };

  // Initialize the game
  useEffect(() => {
    // Mark client as hydrated to render
    setHasHydrated(true);

    // If the user has changed settings that require a new game.
    let shouldRestart = false;
    if (wordLength.value !== wordLengthStore) {
      setWordLengthStore(wordLength.value);
      shouldRestart = true;
    }
    if (ruleset.value !== rulesetStore) {
      setRulesetStore(ruleset.value);
      shouldRestart = true;
    }
    if (shouldRestart) {
      initGame(true);
      return;
    }

    // Only populate grid if we have a target word
    if (!targetWordController.targetWord) return;

    // If this is a new game, reset UI and populate grid
    if (referenceGridId !== gameId) {
      // Reset state & UI (but does not increment the ID unlike restartGame)
      initGame();
    }
  }, []);

  const referenceGridAnimationTracker = useAnimationTracker((finishedMap) => {
    referenceGrid.flushAnimation(finishedMap);
  });

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
    referenceGrid.updateRow(0, revealedRow);
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
    addToast(message);
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
    addToast,
    handleValidationError,
    setValidationError,
    updateKeyStatuses,
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
      statuses: keyStatuses,
      update: updateKeyStatuses,
      reset: resetKeyStatuses,
    },

    game: {
      gameState: gameState.state,
      validationError,
      wordFetchError: targetWordController.wordFetchError,
      targetWord: targetWordController.targetWord,
      restartGame,
    },

    toasts: {
      list: toastList,
      removeToast,
    },

    input: {
      handle: handleInput,
    },

    render: {
      hasHydrated,
    },
  };
};
