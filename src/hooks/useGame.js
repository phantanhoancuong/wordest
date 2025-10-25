import { useRef, useState } from "react";

import { validateWord } from "../lib/api";
import {
  ATTEMPTS,
  WORD_LENGTH,
  CellStatus,
  CellAnimation,
  BOUNCE_ANIMATION_DELAY,
  SHAKE_ANIMATION_DELAY,
} from "../lib/constants";
import { evaluateGuess, mapGuessToRow } from "../lib/utils";

import { useGridState } from "./useGridState";
import { useKeyboardInput } from "./useKeyboardInput";
import { useKeyStatuses } from "./useKeyStatuses";
import { useLatest } from "./useLatest";
import { useSoundPlayer } from "./useSoundPlayer";
import { useTargetWord } from "./useTargetWord";
import { useToasts } from "./useToasts";

/**
 * Hook to manage the state and logic of the game.
 *
 * Tracks the grid of guesses, keyboard statuses, game state, toasts, input handling, and sound playback.
 *
 * @returns {Object} Game utilities
 * @property {Object} grid - Grid data and animation handler
 * @property {Array<Array<Object>>} grid.data - 2D array of cell objects
 * @property {Function} grid.handleAnimationEnd - Resets animation for a cell
 * @property {Object} keyboard - Keyboard status utilities
 * @property {Object} keyboard.statuses - Mapping of letters to their CellStatus
 * @property {Function} keyboard.update - Updates statuses based on guesses.
 * @property {Function} keyboard.reset - Resets all keyboard statuses.
 * @property {Object} game - Game state.
 * @property {boolean} game.gameOver - Whether the game has ended.
 * @property {string} game.validationError - Latest validation error message.
 * @property {string} game.wordFetchError - Error fetching the target word.
 * @property {Function} game.restartGame - Resets the game state.
 * @property {Object} toasts - Toast notifications
 * @property {Array<Object>} toasts.list - List of active toasts.
 * @property {Function} toasts.removeToast - Removes a toast by ID
 * @property {Object} input - Input handling utilities.
 * @property {Function} input.handle - Handles keyboard input.
 */
export const useGame = () => {
  const { targetWord, targetLetterCount, wordFetchError, reloadTargetWord } =
    useTargetWord();

  const [gameOver, setGameOver] = useState(false);
  const [rowState, setRowState] = useState(0);
  const [colState, setColState] = useState(0);
  const [validationError, setValidationError] = useState("");

  const animatingCellNum = useRef(0);
  const pendingRowIncrement = useRef(false);
  const finishedCellMap = useRef(new Map());
  const inputLocked = useRef(false);

  const rowRef = useLatest(rowState);
  const colRef = useLatest(colState);

  const { toasts, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();

  const { grid, gridRef, updateCell, updateRow, flushAnimation, resetGrid } =
    useGridState();

  /**
   * Handles the cell's data at the end of its animation.
   *
   * Decrements the active animation counter, clears finished animations when all have ended,
   * and advances to the next row if needed.
   *
   * @param {number} rowIndex - The row index of the animated cell.
   * @param {number} colIndex - The column index of the animated cell.
   * @returns {void}
   */
  const handleAnimationEnd = (rowIndex, colIndex) => {
    if (!finishedCellMap.current.has(rowIndex)) {
      finishedCellMap.current.set(rowIndex, []);
    }

    finishedCellMap.current.get(rowIndex).push(colIndex);

    animatingCellNum.current = Math.max(0, animatingCellNum.current - 1);
    console.log(animatingCellNum.current);

    if (animatingCellNum.current === 0) {
      if (pendingRowIncrement.current === true) {
        setColState(0);
        setRowState((r) => r + 1);
        pendingRowIncrement.current = false;
      }

      flushAnimation(finishedCellMap.current);
      finishedCellMap.current.clear();
    }
  };

  /**
   * Resets all game states, grid, keyboard, and target word to start a new game.
   *
   * @returns {void}
   */
  const restartGame = () => {
    setRowState(0);
    setColState(0);
    resetGrid();
    setGameOver(false);
    animatingCellNum.current = 0;
    pendingRowIncrement.current = false;
    finishedCellMap.current.clear();
    resetKeyStatuses();
    reloadTargetWord();
  };

  /**
   * Plays a random key press sound from the preloaded set.
   *
   * @type {Function}
   */
  const playKeySound = useSoundPlayer([
    "/sounds/key_01.mp3",
    "/sounds/key_02.mp3",
  ]);

  /**
   * Submits the guess (current row) for evaluation and updates game states.
   *
   * @param {number} row - the row index to submit.
   * @returns {Promise<void>}
   */
  const submitGuess = async (row) => {
    if (inputLocked.current) return;
    inputLocked.current = true;

    try {
      const guess = gridRef.current[row].map((cell) => cell.char).join("");
      if (guess.length !== WORD_LENGTH) return;

      const { status, ok } = await validateWord(guess);

      if (status === 422) {
        setValidationError("Not in word list.");
        addToast("Not in word list.");

        const newRow = mapGuessToRow(
          guess,
          Array(WORD_LENGTH).fill(CellStatus.DEFAULT),
          {
            animation: CellAnimation.SHAKE,
            animationDelay: SHAKE_ANIMATION_DELAY,
            isConsecutive: false,
          }
        );

        animatingCellNum.current += WORD_LENGTH;
        updateRow(row, newRow);
        return;
      }

      if (status === 500 || !ok) {
        const message = "Error validating word. Please try again.";
        setValidationError(message);
        addToast(message);
        return;
      }

      setValidationError("");

      const statuses = evaluateGuess(
        guess,
        targetWord,
        targetLetterCount.current
      );

      const newRow = mapGuessToRow(guess, statuses, {
        animation: CellAnimation.BOUNCE,
        animationDelay: BOUNCE_ANIMATION_DELAY,
        isConsecutive: true,
      });

      updateRow(row, newRow);
      animatingCellNum.current += WORD_LENGTH;
      updateKeyStatuses(guess, statuses);

      if (guess === targetWord) {
        addToast("You win!");
        setGameOver(true);
        return;
      }

      if (row + 1 >= ATTEMPTS) {
        addToast(`The word was: ${targetWord}`);
        setGameOver(true);
        return;
      }

      pendingRowIncrement.current = true;
    } finally {
      const unlockInterval = setInterval(() => {
        if (animatingCellNum.current === 0) {
          inputLocked.current = false;
          clearInterval(unlockInterval);
        }
      }, 50);
    }
  };

  /**
   * Handles keyboard input for the game.
   *
   * @param {string} key - The key pressed by the user.
   * @returns {void}
   */
  const handleInput = (key) => {
    if (
      gameOver ||
      !targetWord ||
      animatingCellNum.current > 0 ||
      inputLocked.current
    )
      return;

    const row = rowRef.current;
    const col = colRef.current;

    if (key === "Backspace") {
      playKeySound();
      setColState((prev) => {
        if (prev === 0) return prev;
        const newCol = prev - 1;
        updateCell(row, newCol);
        return newCol;
      });
      return;
    }

    if (key === "Enter") {
      playKeySound();
      if (col !== WORD_LENGTH) return;
      submitGuess(row);
      return;
    }

    const letter = key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      playKeySound();
      setColState((c) => {
        if (c >= WORD_LENGTH) return c;
        updateCell(row, c, { char: letter });
        return c + 1;
      });
    }
  };

  useKeyboardInput(handleInput);

  return {
    grid: {
      data: grid,
      handleAnimationEnd,
    },

    keyboard: {
      statuses: keyStatuses,
      update: updateKeyStatuses,
      reset: resetKeyStatuses,
    },

    game: {
      gameOver,
      validationError,
      wordFetchError,
      targetWord,
      restartGame,
    },

    toasts: {
      list: toasts,
      removeToast,
    },

    input: {
      handle: handleInput,
    },
  };
};
