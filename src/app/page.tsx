"use client";

import { Grid, Keyboard, ToastBar, Banner } from "@/components";
import styles from "@/app/page.module.css";

import { useGame } from "@/hooks/useGame";
import { renderEmptyGrid } from "@/lib/utils";

/**
 * Main game page component.
 *
 * This component renders:
 * - The **game grid** where players make guesses.
 * - The **answer grid** displaying the hidden target word.
 * - The **keyboard** for letter input.
 * - A **toast bar** for game feedback and messages.
 * - A **banner** (header) and a **landscape warning** for small screens.
 *
 * Uses the {@link useGame} hook to manage game state, user input, and UI updates.
 */
export default function Home() {
  const { gameGrid, answerGrid, keyboard, game, toasts, input, render } =
    useGame();
  const displayGameGrid = render.hasHydrated
    ? gameGrid.renderGrid
    : renderEmptyGrid(gameGrid.rowNum, gameGrid.colNum);
  const displayAnswerGrid = render.hasHydrated
    ? answerGrid.renderGrid
    : renderEmptyGrid(answerGrid.rowNum, answerGrid.colNum);

  return (
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner />
      </header>

      <main className={styles["app__content"]}>
        {game.wordFetchError ? (
          <p className={styles["game__error"]}>{game.wordFetchError}</p>
        ) : (
          <section className={`${styles["game-board"]} flex-center`}>
            <div className={styles["game-board__grid"]}>
              <Grid
                grid={displayGameGrid}
                onAnimationEnd={
                  displayGameGrid === gameGrid.renderGrid
                    ? gameGrid.handleAnimationEnd
                    : undefined
                }
                layoutRows={gameGrid.rowNum}
                layoutCols={gameGrid.colNum}
              />
            </div>

            <div className={styles["game-board__controls"]}>
              <Grid
                grid={displayAnswerGrid}
                onAnimationEnd={
                  displayAnswerGrid === answerGrid.renderGrid
                    ? answerGrid.handleAnimationEnd
                    : undefined
                }
                layoutRows={gameGrid.rowNum}
                layoutCols={gameGrid.colNum}
              />
              <button
                className={styles["game-board__button"]}
                onClick={game.restartGame}
              >
                Restart
              </button>
            </div>

            <ToastBar toasts={toasts.list} removeToast={toasts.removeToast} />
          </section>
        )}
      </main>

      <footer className={styles["app__keyboard"]}>
        <Keyboard keyStatuses={keyboard.statuses} onKeyClick={input.handle} />
      </footer>

      <div className={styles["landscape-warning"]}>
        The game doesn't fit on your screen in this orientation.
        <br />
        Please rotate your device.
      </div>
    </div>
  );
}
