"use client";

import {
  animationTiming,
  CellAnimation,
  CellStatus,
  GameState,
} from "@/lib/constants";

import { CellStatusType, RenderCell } from "@/types/cell";
import { UseAnimationTrackerReturn } from "@/types/useAnimationTracker.types";
import { UseCursorControllerReturn } from "@/types/useCursorController.types";
import { UseStrictConstraintsReturn } from "@/types/useStrictConstraints.types";
import { UseGameStateReturn } from "@/types/useGameState.types";
import { useGameGridReturn } from "@/types/useGameGrid.types";
import { useReferenceRowReturn } from "@/types/useReferenceRow.types";
import { Ruleset, WordLength } from "@/lib/constants";
import { MutableRefObject, RefObject } from "react";

/**
 * Hook that handles guess submission, validation, and post-submission updates.
 *
 * Orchestrate the submission flow:
 * - Validate guess completeness and strict constraints compliance.
 * - Send guess to server for dictionary validation and evaluation.
 * - Update game grid with evaluated cell statuses and animation.
 * - Update reference row with new correct letters.
 * - Update keyboard key statuses based on guess feedback.
 * - Transition game state on win/loss conditions.
 * - Display appropriate toast notifications.
 *
 * @param isStrict - Whether strict or hardcore ruleset is active.
 * @param ruleset - Current ruleset (NORMAL, STRICCT, or HARDCORE).
 * @param wordLength - Length of the target word.
 * @param animationSpeedMultiplier - Speed multiplier for all animations.
 * @param gameGrid - Game grid controller for managing the main board.
 * @param referenceRow - Reference row controller for showing correct letters.
 * @param gameGridAnimationTracker - Track game grid cell animations.
 * @param referenceGridAnimationTracker - Track reference row cell animations.
 * @param cursorController - Controller for cursor position.
 * @param gameStateController - Controller for game state transitions.
 * @param strictConstraintsController - Controller for strict constraints enforcenment.
 * @param addToast - Function to display toast notifications.
 * @param handleValidationError - Callback for server validation errors.
 * @param updateKeyStatuses - Function to update keyboard key colors.
 * @returns Submit function to be called when the player presses Enter.
 */
export const useGuessSubmission = (
  isStrict: boolean,
  ruleset: Ruleset,
  wordLength: WordLength,
  animationSpeedMultiplier: number,
  gameGrid: useGameGridReturn,
  referenceRow: useReferenceRowReturn,
  gameGridAnimationTracker: UseAnimationTrackerReturn,
  referenceGridAnimationTracker: UseAnimationTrackerReturn,
  cursorController: UseCursorControllerReturn,
  gameStateController: UseGameStateReturn,
  strictConstraintsController: UseStrictConstraintsReturn,
  addToast: (message: string) => void,
  updateKeyStatuses: (guess: string, statuses: CellStatusType[]) => void,
  targetWordRef: RefObject<string | null>,
): (() => void) => {
  /**
   * Handle an invalid guess by showing an error and triggering shake animation.
   *
   * Display a toast message explaining why the guess was rejected:
   * - Not in dictionary.
   * - Strict constraint violation.
   * - Incomplete.
   * Apply shake animation to the current row to provide visual feedback.
   *
   * @param row - Index of the row containing the invalid guess.
   * @param message - Error message to display in the toast.
   */
  const handleInvalidGuess = (
    row: number,
    message: string = "Not in word list",
  ): void => {
    addToast(message);
    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.applyInvalidGuessAnimation(row);
  };

  /**
   * Handle a valid guess by updating all game state after server evaluation.
   *
   * Execute the following updates:
   * - Sync strict constraints if strict/hadecore ruleset is active.
   * - Update reference row with newly discovered correct letters.
   * - Apply bounce animations to the guess row with evaluated statuses.
   * - Update keyboard key statuses based on letter feedback.
   * - Transition game state and advance cursor (or end game on win/loss).
   *
   * The target word is not revealed immediately on game end;
   * instead it's stored in {@link targetWordRef} and revealed after game grid animations complete.
   *
   * @param statuses - Evaluated cell statuses from server (CORRECT, PRESENT, or ABSENT).
   * @param gameState - New game state from server (PLAYING, WON, or LOST).
   * @param lockedPositions - Map of confirmed correct letter positions (strict/harcore ruleset).
   * @param minimumLetterCounts - Minimum required counts for revealed letters (strict/hardcore ruleset).
   * @param guess - The submitted guess string.
   * @param row - Index of the current guess row.
   */
  const handleValidGuess = (
    statuses: CellStatusType[],
    gameState: GameState,
    lockedPositions: Record<number, string>,
    minimumLetterCounts: Record<string, number>,
    targetWord: string | null,
    guess: string,
    row: number,
  ): void => {
    if (isStrict)
      strictConstraintsController.syncStrictConstraints(
        lockedPositions,
        minimumLetterCounts,
      );

    // Only update reference row incrementally if game is still in progress.
    if (gameState === GameState.PLAYING) {
      const prevReferenceRow = referenceRow.rowRef.current;
      const nextReferenceRow = [...referenceRow.rowRef.current];
      let changedCount = 0;

      for (let i = 0; i < nextReferenceRow.length; ++i) {
        const prevCell = prevReferenceRow[i];
        if (prevCell.status === CellStatus.CORRECT) continue;

        if (statuses[i] === CellStatus.CORRECT) {
          nextReferenceRow[i] = {
            ...prevCell,
            char: guess[i],
            status: CellStatus.CORRECT,
            animation: CellAnimation.BOUNCE,
            animationDelay:
              i * animationTiming.bounce.delay * animationSpeedMultiplier,
          };
          changedCount++;
        }
      }

      if (changedCount > 0) {
        referenceGridAnimationTracker.add(changedCount);
        referenceRow.updateRow(nextReferenceRow);
      }
    } else {
      // If the game ends, store target word for reveal after animations
      targetWordRef.current = targetWord;
    }

    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.applyValidGuessAnimation(row, statuses, animationSpeedMultiplier);

    updateKeyStatuses(guess, statuses);

    if (gameState === GameState.WON) {
      addToast("You won!");
      gameStateController.setGameState(GameState.WON);
      return;
    }

    if (gameState === GameState.LOST) {
      addToast("You lost!");
      gameStateController.setGameState(GameState.LOST);
      return;
    }

    cursorController.advanceRow();
  };

  /**
   * Submit the current guess for validation and evaluation.
   *
   * Validate in three stages:
   * 1. Client-side: Check if the guess is complete (all cells filled).
   * 2. Server-side: Validate dictionary and strict constraints.
   * 3. Evaluation: If valid, evaluate the guess and update game state.
   *
   * On validation failure at any stage, display an appropriate error message
   * and trigger shake animation. On success, delegate to {@link handleValidGuess}.
   *
   * @returns Promise that resolves after submission completes.
   */
  const submitGuess = async (): Promise<void> => {
    if (cursorController.col.current !== gameGrid.colNum) {
      handleInvalidGuess(cursorController.row.current, "Incomplete guess.");
      return;
    }

    const guess = gameGrid.gridRef.current[cursorController.row.current]
      .map((cell: RenderCell) => cell.char)
      .join("");

    const validationResult = await fetch("/api/practice/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess, ruleset, wordLength, isStrict }),
    });
    const validationData = await validationResult.json();

    if (validationResult.status >= 500) return;

    if (validationResult.status === 422 || validationResult.status === 400) {
      handleInvalidGuess(cursorController.row.current, validationData.message);
      return;
    }

    handleValidGuess(
      validationData.data.statuses,
      validationData.data.gameState,
      validationData.data.lockedPositions,
      validationData.data.minimumLetterCounts,
      validationData.data.targetWord,
      guess,
      cursorController.row.current,
    );
  };

  return submitGuess;
};
