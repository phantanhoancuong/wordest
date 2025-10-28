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
 * @returns {Object} Game utilities.
 * @property {Object} gameGrid - Grid data and animation handler for the player's guesses.
 * @property {Array<Array<Object>>} gameGrid.data - 2D array of cell objects.
 * @property {number} gameGrid.rowNum - Total number of rows.
 * @property {number} gameGrid.colNum - Total number of columns.
 * @property {Object} answerGrid - Grid data and animation handler for the answer grid.
 * @property {Array<Array<Object>>} answerGrid.data - 2D array of cell objects.
 * @property {number} answerGrid.rowNum - Total number of rows.
 * @property {number} answerGrid.colNum - Total number of columns.
 * @property {Function} grid.handleAnimationEnd - Resets animation for a cell.
 * @property {Object} keyboard - Keyboard status utilities.
 * @property {Object} keyboard.statuses - Mapping of letters to their CellStatus.
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

  const pendingGameOver = useRef(false);

  const rowRef = useLatest(rowState);
  const colRef = useLatest(colState);

  const { toasts, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();

  const gameGrid = useGridState(ATTEMPTS, WORD_LENGTH);
  const answerGrid = useGridState(1, WORD_LENGTH);

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

    if (animatingCellNum.current === 0) {
      gameGrid.flushAnimation(new Map(finishedCellMap.current));
      finishedCellMap.current.clear();
      inputLocked.current = false;

      if (pendingRowIncrement.current === true) {
        setColState(0);
        setRowState((r) => r + 1);
        pendingRowIncrement.current = false;
      }

      if (pendingGameOver.current === true) {
        setGameOver(true);
        pendingGameOver.current = false;
      }
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
    gameGrid.resetGrid();
    pendingGameOver.current = false;
    setGameOver(false);
    animatingCellNum.current = 0;
    pendingRowIncrement.current = false;
    finishedCellMap.current.clear();
    inputLocked.current = false;
    resetKeyStatuses();
    reloadTargetWord();
  };

  /**
   * Plays a random key press sound from the preloaded set.
   *
   * @type {() => void}
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
      const guess = gameGrid.gridRef.current[row]
        .map((cell) => cell.char)
        .join("");
      if (guess.length !== gameGrid.colNum) return;

      const { status, ok } = await validateWord(guess);

      if (status === 422) {
        setValidationError("Not in word list.");
        addToast("Not in word list.");

        const newRow = mapGuessToRow(
          guess,
          Array(gameGrid.colNum).fill(CellStatus.DEFAULT),
          {
            animation: CellAnimation.SHAKE,
            animationDelay: SHAKE_ANIMATION_DELAY,
            isConsecutive: false,
          }
        );

        animatingCellNum.current += gameGrid.colNum;
        gameGrid.updateRow(row, newRow);
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

      gameGrid.updateRow(row, newRow);
      animatingCellNum.current += gameGrid.colNum;
      updateKeyStatuses(guess, statuses);

      if (guess === targetWord) {
        addToast("You win!");
        pendingGameOver.current = true;
        return;
      }

      if (row + 1 >= gameGrid.rowNum) {
        addToast(`The word was: ${targetWord}`);
        pendingGameOver.current = true;
        return;
      }

      pendingRowIncrement.current = true;
    } catch (error) {
      console.error("submitGuess error:", error);
      addToast("Unexpected error occurred.");
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
        gameGrid.updateCell(row, newCol);
        return newCol;
      });
      return;
    }

    if (key === "Enter") {
      playKeySound();
      if (col !== gameGrid.colNum) return;
      submitGuess(row);
      return;
    }

    const letter = key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      playKeySound();
      setColState((c) => {
        if (c >= gameGrid.colNum) return c;
        gameGrid.updateCell(row, c, { char: letter });
        return c + 1;
      });
    }
  };

  useKeyboardInput(handleInput);

  return {
    gameGrid: {
      data: gameGrid.grid,
      rowNum: gameGrid.rowNum,
      colNum: gameGrid.colNum,
      handleAnimationEnd,
    },

    answerGrid: {
      data: answerGrid.grid,
      rowNum: answerGrid.rowNum,
      colNum: answerGrid.colNum,
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
