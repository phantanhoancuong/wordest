"use client";

import { Grid, Keyboard, ToastBar, Banner } from "../components";
import styles from "./page.module.css";

import { useGame } from "../hooks/useGame";

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
 *
 * @component
 * @returns {JSX.Element} The rendered game page.
 */
export default function Home() {
  const { gameGrid, answerGrid, keyboard, game, toasts, input } = useGame();

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
                grid={gameGrid.data}
                onAnimationEnd={gameGrid.handleAnimationEnd}
                dataRows={gameGrid.rowNum}
                dataCols={gameGrid.colNum}
                layoutRows={gameGrid.rowNum}
                layoutCols={gameGrid.colNum}
              />
            </div>

            <div className={styles["game-board__controls"]}>
              <Grid
                grid={answerGrid.data}
                layoutRows={6}
                layoutCols={gameGrid.colNum}
              />
              <button onClick={game.restartGame}>Restart</button>
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
