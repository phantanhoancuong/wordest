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

/**
 * Hook to manage the state and logic of the game.
 *
 * Tracks the grid of guesses, keyboard statuses, game state, toasts, input handling, and sound playback.
 *
 * @returns {Object} Game utilities.
 *
 * @property {Object} gameGrid - Grid data and animation handler for the player's guesses.
 * @property {Array<Array<Object>>} gameGrid.data - 2D array of cell objects.
 * @property {number} gameGrid.rowNum - Total number of rows.
 * @property {number} gameGrid.colNum - Total number of columns.
 * @property {Function} gameGrid.handleAnimationEnd - Called when a cell's animation ends to update game state.
 *
 * @property {Object} answerGrid - Grid data and animation handler for the answer grid.
 * @property {number} answerGrid.rowNum - Total number of rows.
 * @property {number} answerGrid.colNum - Total number of columns.
 *
 * @property {Object} keyboard - Keyboard status utilities.
 * @property {Object} keyboard.statuses - Mapping of letters to their CellStatus.
 * @property {Function} keyboard.update - Updates statuses based on guesses.
 * @property {Function} keyboard.reset - Resets all keyboard statuses.
 *
 * @property {Object} game - Game state.
 * @property {boolean} game.gameOver - Whether the game has ended.
 * @property {string} game.validationError - Latest validation error message.
 * @property {string} game.wordFetchError - Error fetching the target word.
 * @property {Function} game.restartGame - Resets the game state.
 *
 * @property {Object} toasts - Toast notifications
 * @property {Array<Object>} toasts.list - List of active toasts.
 * @property {Function} toasts.removeToast - Removes a toast by ID
 *
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
    toasts.forEach((t) => removeToast(t.id));
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
        animationDelay: animationTiming.shakeDelay,
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
      animationDelay: animationTiming.bounceDelay,
      isConsecutive: true,
    });

    const answerRow = answerGrid.gridRef.current[0].map((cell, i) => {
      if (cell.status === CellStatus.CORRECT) return cell;

      if (statuses[i] === CellStatus.CORRECT) {
        return {
          ...cell,
          status: CellStatus.HIDDEN,
          animation: CellAnimation.BOUNCE_REVEAL,
          animationDelay: i * animationTiming.bounceRevealDelay,
        };
      }

      return cell;
    });

    gameGrid.updateRow(row, newRow);
    answerGrid.updateRow(0, answerRow);
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

    playKeySound();

    switch (key) {
      case "Backspace":
        return setColState((prev) => {
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

      case "Enter":
        if (colRef.current === gameGrid.colNum) submitGuess();
        return;

      default:
        const letter = key.toUpperCase();
        if (/^[A-Z]$/.test(letter)) {
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
      list: toastList,
      removeToast,
    },

    input: {
      handle: handleInput,
    },
  };
};
