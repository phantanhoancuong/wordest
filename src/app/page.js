"use client";

import { Grid, Keyboard, ToastBar, Banner } from "../components";
import styles from "./page.module.css";

import { CellStatus, CellAnimation } from "../lib/constants";
import { useGame } from "../hooks/useGame";

/**
 * Main game page component.
 *
 * Renders the game board, keyboard, toasts, and banners.
 * Handles game state updates and user input via the `useGame` hook.
 *
 * @component
 * @returns {JSX.Element} The rendered game page.
 */
export default function Home() {
  const { grid, keyboard, game, toasts, input } = useGame();

  return (
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner />
      </header>

      <main className={styles["app__game"]}>
        {game.wordFetchError ? (
          <section className={styles["game__error"]}>
            <p>{game.wordFetchError}</p>
          </section>
        ) : (
          <section className={`${styles["game-board"]} flex-center`}>
            <div className={styles["game-board__grid"]}>
              <Grid
                grid={
                  game.gameOver
                    ? [
                        game.targetWord.split("").map((char) => ({
                          char,
                          status: CellStatus.CORRECT,
                          animation: CellAnimation.NONE,
                          animationDelay: 0,
                        })),
                      ]
                    : grid.data
                }
                onAnimationEnd={grid.handleAnimationEnd}
              />
            </div>

            <div className={styles["game-board__buttons"]}>
              {game.gameOver && (
                <button onClick={game.restartGame}>Restart</button>
              )}
            </div>
            <ToastBar
              className={styles["app__toast-bar"]}
              toasts={toasts.list}
              removeToast={toasts.removeToast}
            />
          </section>
        )}
      </main>

      <footer className={`${styles["app__keyboard"]}`}>
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
