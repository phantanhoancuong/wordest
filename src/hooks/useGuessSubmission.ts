import {
  animationTiming,
  CellAnimation,
  CellStatus,
  GameState,
} from "@/lib/constants";

import { validateWord } from "@/lib/api";
import { evaluateGuess } from "@/lib/utils";

import { CellStatusType } from "@/types/cell";
import { UseAnimationTrackerReturn } from "@/types/useAnimationTracker.types";
import { UseCursorControllerReturn } from "@/types/useCursorController.types";
import { UseExpertModeConstraintsReturn } from "@/types/useExpertModeConstraints.types";
import { UseGameStateReturn } from "@/types/useGameState.types";
import { UseGridStateReturn } from "@/types/useGridState.types";

/**
 * Hook responsible for handling guess submission logic.
 *
 * Encapsulates:
 * - Guess validation via API
 * - Grid updates and animations
 * - Keyboard status updates
 * - Game state transitions (win / lose)
 * - Error handling and toasts
 *
 * This hook returns a `submitGuess` function intended to be called
 * when the user presses Enter.
 */
export const useGuessSubmission = (
  isExpertMode: boolean,
  animationSpeedMultiplier: number,
  targetLetterCount: React.RefObject<Record<string, number>>,
  targetWord: string,
  referenceGrid: UseGridStateReturn,
  gameGrid: UseGridStateReturn,
  gameState: UseGameStateReturn,
  cursor: UseCursorControllerReturn,
  gameGridAnimationTracker: UseAnimationTrackerReturn,
  referenceGridAnimationTracker: UseAnimationTrackerReturn,
  useExpertModeConstraints: UseExpertModeConstraintsReturn,
  addToast: (message: string) => void,
  handleValidationError: () => void,
  setValidationError: React.Dispatch<React.SetStateAction<string>>,
  updateKeyStatuses: (guess: string, statuses: CellStatusType[]) => void
): (() => void) => {
  /**
   * Handles an invalid guess (not in dictionary).
   *
   * - Displays a validation error
   * - Triggers shake animation on the current row
   * - Registers animations with the animation tracker
   *
   * @param row - Current row index
   */
  const handleInvalidGuess = (
    row: number,
    message: string = "Not in word list"
  ): void => {
    setValidationError(message);
    addToast(message);
    cursor.cancelPendingRowAdvance();
    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.applyInvalidGuessAnimation(row, animationSpeedMultiplier);
  };

  /**
   * Handles a valid guess.
   *
   * - Evaluates the guess against the target word to produce cell statuses.
   * - Updates Expert mode constraints by:
   *   - Locking confirmed correct letters to their positions.
   *   - Tracking the minimum required count of revealed letters.
   * - Reveals newly confirmed correct letters in the reference grid.
   * - Applies flip/bounce animations to the guess row.
   * - Updates keyboard key statuses based on the evaluation.
   * - Queues game state transitions (win/lose) when applicable.
   *
   * @param guess - The submitted guess string.
   * @param row - Index of the current guess row.
   */
  const handleValidGuess = (guess: string, row: number): void => {
    const statuses = evaluateGuess(
      guess,
      targetWord,
      targetLetterCount.current
    );

    if (isExpertMode) {
      useExpertModeConstraints.updateExpertConstraints(guess, statuses);
    }

    const prevReferenceRow = referenceGrid.renderGridRef.current[0];
    const preferenceRow = [...prevReferenceRow];
    let changedCount = 0;

    for (let i = 0; i < preferenceRow.length; i++) {
      const prevCell = prevReferenceRow[i];

      if (prevCell.status === CellStatus.CORRECT) continue;

      if (statuses[i] === CellStatus.CORRECT) {
        preferenceRow[i] = {
          ...prevCell,
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
      referenceGrid.updateRow(0, preferenceRow);
    }

    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.applyValidGuessAnimation(row, statuses, animationSpeedMultiplier);
    updateKeyStatuses(guess, statuses);

    if (guess === targetWord) {
      addToast("You won!");
      gameState.queueState(GameState.WON);
      return;
    }

    if (row + 1 >= gameGrid.rowNum) {
      addToast(`You lost!`);
      gameState.queueState(GameState.LOST);
      return;
    }

    cursor.queueRowAdvance();
  };

  /**
   * Submits the current guess and evaluate step-by-step:
   * 1. Is the guess complete (fill all columns).
   * 2. Does the guess fulfill all expert mode constraints (if expert mode is enabled).
   * 3. Does the guessed word exist in the dictionary of allowed words.
   *
   * If invalid at any step, calls 'handleInvalidGuess()' with an appropriate message.
   */
  const submitGuess = async (): Promise<void> => {
    if (cursor.col.current !== gameGrid.colNum) {
      handleInvalidGuess(cursor.row.current, "Incomplete guess.");
      return;
    }

    const guess = gameGrid.renderGridRef.current[cursor.row.current]
      .map((cell) => cell.char)
      .join("");

    if (isExpertMode) {
      const { isValid, message } =
        useExpertModeConstraints.checkValidExpertGuess(guess);
      if (!isValid) {
        handleInvalidGuess(cursor.row.current, message);
        return;
      }
    }

    try {
      const { status, data } = await validateWord(guess, guess.length);

      if (status >= 500 || !data) {
        handleValidationError();
        return;
      }

      if (!data.valid) {
        handleInvalidGuess(cursor.row.current);
        return;
      }

      setValidationError("");
      handleValidGuess(guess, cursor.row.current);
    } catch (error: unknown) {
      console.error("submitGuess error:", error);
      addToast("Unexpected error occurred.");
    }
  };

  return submitGuess;
};
