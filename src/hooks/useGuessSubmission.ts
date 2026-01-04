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
  animationSpeedMultiplier: number,
  targetLetterCount: React.RefObject<Record<string, number>>,
  targetWord: string,
  answerGrid: UseGridStateReturn,
  gameGrid: UseGridStateReturn,
  gameState: UseGameStateReturn,
  cursor: UseCursorControllerReturn,
  addToast: (message: string) => void,
  handleValidationError: () => void,
  setValidationError: React.Dispatch<React.SetStateAction<string>>,
  updateKeyStatuses: (guess: string, statuses: CellStatusType[]) => void,
  gameGridAnimationTracker: UseAnimationTrackerReturn,
  answerGridAnimationTracker: UseAnimationTrackerReturn
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
  const handleInvalidGuess = (row: number): void => {
    const message = "Not in word list";
    setValidationError(message);
    addToast(message);

    cancelPendingRowAdvance();

    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.applyInvalidGuessAnimation(row, animationSpeedMultiplier);
  };

  /**
   * Cancels any pending row advancement in the cursor.
   *
   * Used when an invalid guess prevents the row from advancing.
   */
  const cancelPendingRowAdvance = () => {
    cursor.pendingRowAdvance.current = false;
  };

  /**
   * Handles a valid guess.
   *
   * - Evaluates the guess against the target word.
   * - Updates the answer grid for newly revealed correct letters.
   * - Applies animations to the guess row.
   * - Updates keyboard key statuses.
   * - Queues game state transitions (win / lose) when applicable.
   *
   * @param guess - Submitted guess string
   * @param row - Current row index
   */
  const handleValidGuess = (guess: string, row: number): void => {
    const statuses = evaluateGuess(
      guess,
      targetWord,
      targetLetterCount.current
    );

    const prevAnswerRow = answerGrid.renderGridRef.current[0];
    const answerRow = [...prevAnswerRow];
    let changedCount = 0;

    for (let i = 0; i < answerRow.length; i++) {
      const prevCell = prevAnswerRow[i];

      if (prevCell.status === CellStatus.CORRECT) continue;
      if (statuses[i] === CellStatus.CORRECT) {
        answerRow[i] = {
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
      answerGridAnimationTracker.add(changedCount);
      answerGrid.updateRow(0, answerRow);
    }

    gameGridAnimationTracker.add(gameGrid.colNum);
    gameGrid.applyValidGuessAnimation(row, statuses, animationSpeedMultiplier);

    updateKeyStatuses(guess, statuses);

    if (guess === targetWord) {
      addToast("You win!");
      gameState.queueState(GameState.WON);
      return;
    }

    if (row + 1 >= gameGrid.rowNum) {
      addToast(`The word was: ${targetWord}`);
      gameState.queueState(GameState.LOST);
      return;
    }

    cursor.queueRowAdvance();
  };

  /**
   * Submits the current guess.
   *
   * - Locks input to prevent concurrent submissions.
   * - Validates guess length.
   * - Calls dictionary validation API.
   * - Delegates to valid / invalid handlers.
   * - Ensures input lock is released on completion.
   */
  const submitGuess = async (): Promise<void> => {
    const guess = gameGrid.renderGridRef.current[cursor.row.current]
      .map((cell) => cell.char)
      .join("");

    if (guess.length !== gameGrid.colNum) return;

    try {
      const { status, data } = await validateWord(guess);

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
