import { useState } from "react";

import { validateWord } from "../lib/api";
import {
  ATTEMPTS,
  WORD_LENGTH,
  CellStatus,
  CellAnimation,
  BOUNCE_ANIMATION_DURATION,
} from "../lib/constants";
import { evaluateGuess } from "../lib/utils";

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
 * @property {Function} game.restart - Resets the game state.
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

  const rowRef = useLatest(rowState);
  const colRef = useLatest(colState);

  const { toasts, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();

  const {
    grid,
    gridRef,
    updateCell,
    updateRow,
    handleAnimationEnd,
    resetGrid,
  } = useGridState();

  const restartGame = () => {
    setRowState(0);
    setColState(0);
    resetGrid();
    setGameOver(false);
    resetKeyStatuses();
    reloadTargetWord();
  };

  const playKeySound = useSoundPlayer([
    "/sounds/key_01.mp3",
    "/sounds/key_02.mp3",
  ]);

  /**
   * Submits the guess (current row) for evaluation and updates game states.
   *
   * @param {number} row - the row index to submit.
   * @returns {Promsise<void>}
   */

  const submitGuess = async (row) => {
    const guess = gridRef.current[row].map((cell) => cell.char).join("");
    if (guess.length !== WORD_LENGTH) return;

    const { status, ok } = await validateWord(guess);

    if (status === 422) {
      setValidationError("Not in word list.");
      addToast("Not in word list.");

      const newRow = guess.split("").map((char) => ({
        char,
        status: CellStatus.DEFAULT,
        animation: CellAnimation.SHAKE,
        animationDelay: 0,
      }));

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

    const newRow = guess.split("").map((char, i) => ({
      char,
      status: statuses[i],
      animation: CellAnimation.BOUNCE,
      animationDelay: i * BOUNCE_ANIMATION_DURATION,
    }));

    updateRow(row, newRow);
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

    setRowState((r) => r + 1);
    setColState(0);
  };

  /**
   * Handles keyboard input for the game.
   *
   * @param {string} key - The key pressed by the user.
   * @returns {void}
   */
  const handleInput = (key) => {
    if (gameOver || !targetWord) return;
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
        updateCell(row, c, letter, CellStatus.DEFAULT);
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
      restart: restartGame,
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
