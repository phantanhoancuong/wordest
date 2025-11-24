import { useMemo, useRef, useState, useEffect } from "react";

import { validateWord } from "../lib/api";
import {
  ATTEMPTS,
  WORD_LENGTH,
  animationTiming,
  CellStatus,
  CellAnimation,
} from "../lib/constants";
import { evaluateGuess, mapGuessToRow } from "../lib/utils";

import { useGridState } from "./useGridState";
import { useKeyboardInput } from "./useKeyboardInput";
import { useKeyStatuses } from "./useKeyStatuses";
import { useLatest } from "./useLatest";
import { useSoundPlayer } from "./useSoundPlayer";
import { useTargetWord } from "./useTargetWord";
import { useToasts } from "./useToasts";
import { UseGameReturn } from "@/types/useGame.types";
import { GameState } from "../lib/constants";
import { useAnimationTracker } from "./useAnimationTracker";
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

  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const pendingGameState = useRef<GameState | null>(null);

  const [rowState, setRowState] = useState(0);
  const [colState, setColState] = useState(0);
  const rowRef = useLatest(rowState);
  const colRef = useLatest(colState);

  const pendingRowIncrement = useRef(false);
  const inputLocked = useRef(false);

  const [validationError, setValidationError] = useState("");

  const { toastList, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();

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

  const playKeySound = useSoundPlayer([
    "/sounds/key_01.mp3",
    "/sounds/key_02.mp3",
  ]);

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
      if (pendingGameState.current != null) {
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

    if (pendingRowIncrement.current === true) {
      setColState(0);
      setRowState((prevRow) => prevRow + 1);
      pendingRowIncrement.current = false;
    }
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
    const nextGameState = pendingGameState.current;
    if (!nextGameState || nextGameState === gameState) return;
    setGameState(nextGameState);

    if (nextGameState !== GameState.PLAYING) {
      revealAnswerGrid(nextGameState);
    }
    pendingGameState.current = null;
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
    setGameState(GameState.PLAYING);
    setRowState(0);
    setColState(0);

    resetKeyStatuses();
    reloadTargetWord();

    gameGrid.resetGrid();
    answerGrid.resetGrid();
    gameGridAnimationTracker.reset();
    pendingGameState.current = null;
    pendingRowIncrement.current = false;
    inputLocked.current = false;

    answerGridAnimationTracker.reset();

    toastList.forEach((t) => removeToast(t.id));
  };

  /**
   * Handles when the guessed word is not in the valid word list.
   *
   * Provides user feedback, applies a shake animation to the current row,
   * and prevents further input until the animation finishes.
   *
   * @param guess - The invalid guessed word.
   * @param row - The index of the current row being updated.
   */
  const handleInvalidGuess = (guess: string, row: number): void => {
    const message = "Not in word list.";
    setValidationError(message);
    addToast(message);

    const shakeRow = mapGuessToRow(
      guess,
      Array(gameGrid.colNum).fill(CellStatus.DEFAULT),
      {
        animation: CellAnimation.SHAKE,
        animationDelay: animationTiming.shake.delay,
        isConsecutive: false,
      }
    );
    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.updateRow(row, shakeRow);
  };

  /**
   * Handles a valid guess by evaluating letter correctness.
   *
   * Applies bounce animations, updates keyboard states, and manage game-over conditions.
   *
   * @param guess - The validated word.
   * @param row - The index of the current row being updated.
   */
  const handleValidGuess = (guess: string, row: number) => {
    const statuses = evaluateGuess(
      guess,
      targetWord,
      targetLetterCount.current
    );

    const newRow = mapGuessToRow(guess, statuses, {
      animation: CellAnimation.BOUNCE,
      animationDelay: animationTiming.bounce.delay,
      isConsecutive: true,
    });

    const prevAnswerRow = answerGrid.gridRef.current[0];
    const answerRow = [...prevAnswerRow];
    let changedCount = 0;

    for (let i = 0; i < answerRow.length; i++) {
      const prevCell = prevAnswerRow[i];

      // If it's already correct, skip it — no animation or change.
      if (prevCell.status === CellStatus.CORRECT) continue;

      // If this guess reveals a correct letter for the first time
      if (statuses[i] === CellStatus.CORRECT) {
        answerRow[i] = {
          ...prevCell,
          status: CellStatus.CORRECT,
          animation: CellAnimation.BOUNCE,
          animationDelay: i * animationTiming.bounce.delay,
        };
        changedCount++;
      }
    }

    if (changedCount > 0) {
      answerGridAnimationTracker.add(changedCount);
      answerGrid.updateRow(0, answerRow);
    }

    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.updateRow(row, newRow);
    updateKeyStatuses(guess, statuses);

    if (guess === targetWord) {
      addToast("You win!");
      pendingGameState.current = GameState.WON;
      return;
    }

    if (row + 1 >= gameGrid.rowNum) {
      addToast(`The word was: ${targetWord}`);
      pendingGameState.current = GameState.LOST;

      return;
    }

    pendingRowIncrement.current = true;
  };

  /**
   * Handles a general validation error.
   */
  const handleValidationError = (): void => {
    const message = "Error validating word. Please try again.";
    setValidationError(message);
    addToast(message);
  };

  /**
   * Submits the guess (current row) for evaluation and updates game states.
   *
   * 1. Reads the current row's guess
   * 2. Validates it through the API.
   * 3. Handles invalid, valid, and error cases.
   *
   * Input is locked during submission to prevent race conditions.
   */
  const submitGuess = async (): Promise<void> => {
    const row = rowRef.current;
    if (inputLocked.current) return;
    inputLocked.current = true;

    const guess = gameGrid.gridRef.current[row]
      .map((cell) => cell.char)
      .join("");
    if (guess.length !== gameGrid.colNum) {
      inputLocked.current = false;
      return;
    }

    try {
      const { status, ok, data } = await validateWord(guess);

      if (status >= 500 || !data) {
        handleValidationError();
        return;
      }

      if (!data?.valid) {
        handleInvalidGuess(guess, row);
        return;
      }

      setValidationError("");

      handleValidGuess(guess, row);
    } catch (error: unknown) {
      console.error("submitGuess error:", error);
      addToast("Unexpected error occurred.");
    } finally {
      inputLocked.current = false;
    }
  };

  /**
   * Handles keyboard input for the game.
   *
   * @param key - The key pressed by the user.
   */
  const handleInput = (key: string): void => {
    if (
      gameState !== GameState.PLAYING ||
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
      setColState((prev) => {
        if (prev === 0) return prev;

        const newCol = prev - 1;

        gameGrid.updateCell(rowRef.current, newCol, {
          char: "",
          status: CellStatus.DEFAULT,
          animation: CellAnimation.NONE,
          animationDelay: 0,
        });

        return newCol;
      });
      return;
    }

    if (isEnter) {
      if (colRef.current === gameGrid.colNum) submitGuess();
      return;
    }

    if (isLetter) {
      const letter = key.toUpperCase();

      setColState((prev) => {
        if (prev >= gameGrid.colNum) return prev;

        gameGrid.updateCell(rowRef.current, prev, {
          char: letter,
          status: CellStatus.DEFAULT,
          animation: CellAnimation.NONE,
          animationDelay: 0,
        });

        return prev + 1;
      });
    }
  };

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
      gameState,
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
