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
  const rowRef = useLatest(rowState);
  const colRef = useLatest(colState);

  const animatingCellNum = useRef(0);
  const pendingRowIncrement = useRef(false);
  const pendingGameOver = useRef(false);
  const finishedCellMap = useRef(new Map());
  const inputLocked = useRef(false);

  const [validationError, setValidationError] = useState("");

  const { toasts, addToast, removeToast } = useToasts();
  const { keyStatuses, updateKeyStatuses, resetKeyStatuses } = useKeyStatuses();

  const gameGrid = useGridState(ATTEMPTS, WORD_LENGTH);
  const answerGrid = useGridState(1, WORD_LENGTH);

  const updateGridSync = (rowIndex) => {
    gameGrid.gridRef.current[rowIndex] = gameRow;
    answerGrid.gridRef.current[0] = answerRow;

    gameGrid.updateRow(rowIndex, gameRow);
    answerGrid.updateRow(0, answerRow);
  };

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
    setGameOver(false);

    setRowState(0);
    setColState(0);

    resetKeyStatuses();
    reloadTargetWord();

    gameGrid.resetGrid();
    answerGrid.resetGrid();
    animatingCellNum.current = 0;
    finishedCellMap.current.clear();
    pendingGameOver.current = false;
    pendingRowIncrement.current = false;
    inputLocked.current = false;
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
   * Handles when the guessed word is not in the valid word list.
   *
   * Provides user feedback, applies a shake animation to the current row,
   * and prevents further input until the animation finishes.
   *
   * @param {string} guess - The invalid guessed word.
   * @param {number} row - The index of the current row being updated.
   * @returns {void}
   */
  const handleInvalidGuess = (guess, row) => {
    const message = "Not in word list.";
    setValidationError(message);
    addToast(message);

    const shakeRow = mapGuessToRow(
      guess,
      Array(gameGrid.colNum).fill(CellStatus.DEFAULT),
      {
        animation: CellAnimation.SHAKE,
        animationDelay: SHAKE_ANIMATION_DELAY,
        isConsecutive: false,
      }
    );

    animatingCellNum.current += gameGrid.colNum;
    gameGrid.updateRow(row, shakeRow);
  };

  /**
   * Handles a valid guess by evaluating letter correctness.
   *
   * Applies bounce animations, updates keyboard states, and manage game-over conditions.
   *
   * @param {string} guess - The validated word.
   * @param {number} row - The index of the current row being updated.
   * @returns {void}
   */
  const handleValidGuess = (guess, row) => {
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
  };

  /**
   * Handles a general validation error.
   *
   * @returns {void}
   */

  const handleValidationError = () => {
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
   * @async
   * @function submitGuess
   * @returns {Promise<void>} Resolves once the guess submission and updates are complete.
   */
  const submitGuess = async () => {
    const row = rowRef.current;
    if (inputLocked.current) return;
    inputLocked.current = true;

    const guess = gameGrid.gridRef.current[row]
      .map((cell) => cell.char)
      .join("");
    if (guess.length !== gameGrid.colNum) return;

    try {
      const { status, ok, data } = await validateWord(guess);

      if (!ok || !data) {
        handleValidationError();
        return;
      }

      if (!data.valid) {
        handleInvalidGuess(guess, row);
        return;
      }

      setValidationError("");

      handleValidGuess(guess, row);
    } catch (error) {
      console.error("submitGuess error:", error);
      addToast("Unexpected error occurred.");
    } finally {
      inputLocked.current = false;
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

    if (key === "Backspace") {
      playKeySound();
      setColState((prevCol) => {
        if (prevCol === 0) return prevCol;
        const newCol = prevCol - 1;
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

    if (key === "Enter") {
      playKeySound();
      if (colRef.current !== gameGrid.colNum) return;
      submitGuess();
      return;
    }

    const letter = key.toUpperCase();
    if (/^[A-Z]$/.test(letter)) {
      playKeySound();
      setColState((prevCol) => {
        if (prevCol >= gameGrid.colNum) return prevCol;
        gameGrid.updateCell(rowRef.current, prevCol, {
          char: letter,
          status: CellStatus.DEFAULT,
          animation: CellAnimation.NONE,
          animationDelay: 0,
        });
        return prevCol + 1;
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
