"use client";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { Ruleset } from "@/lib/constants";

import { useGame } from "@/hooks/useGame";

import { Grid, Keyboard, ToastBar, Banner } from "@/components";

import styles from "@/app/page.module.css";

/**
 * Main game page component.
 *
 * This component renders:
 * - The **game grid** where players make guesses.
 * - The **reference grid** displaying the hidden target word.
 * - The **keyboard** for letter input.
 * - A **toast bar** for game feedback and messages.
 * - A **banner** (header) and a **landscape warning** for small screens.
 *
 * Uses the {@link useGame} hook to manage game state, user input, and UI updates.
 */
export default function Home() {
  const { gameGrid, referenceGrid, keyboard, game, toasts, input, render } =
    useGame();

  const { ruleset, showReferenceGrid, showKeyStatuses } = useSettingsContext();
  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;

  const renderReferenceGrid =
    ruleset.value !== Ruleset.HARDCORE && showReferenceGrid.value;
  const renderKeyStatuses =
    ruleset.value !== Ruleset.HARDCORE && showKeyStatuses.value;

  if (!render.hasHydrated) return null;
  return (
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner />
      </header>

      <main className={styles["app__content"]}>
        {game.wordFetchError ? (
          <p className={styles["game__error"]}>{game.wordFetchError}</p>
        ) : (
          <section className={styles["game-board__container"]}>
            <div className={styles["game-board__date"]}>
              {"daily mode (" + date + ")"}
            </div>
            <div className={`${styles["game-board"]} flex-center`}>
              <div className={styles["game-board__stack"]}>
                <div className={styles["game-board__grid"]}>
                  <Grid
                    grid={gameGrid.renderGrid}
                    onAnimationEnd={gameGrid.handleAnimationEnd}
                    layoutRows={gameGrid.rowNum}
                    layoutCols={gameGrid.colNum}
                  />
                </div>

                <div className={styles["game-board__controls"]}>
                  {renderReferenceGrid ? (
                    <Grid
                      grid={referenceGrid.renderGrid}
                      onAnimationEnd={referenceGrid.handleAnimationEnd}
                      layoutRows={gameGrid.rowNum}
                      layoutCols={gameGrid.colNum}
                    />
                  ) : null}
                  <button
                    className={styles["game-board__button"]}
                    onClick={game.restartGame}
                  >
                    restart
                  </button>
                </div>
              </div>

              <ToastBar toasts={toasts.list} removeToast={toasts.removeToast} />
            </div>
          </section>
        )}
      </main>

      <footer className={styles["app__keyboard"]}>
        <Keyboard
          renderKeyStatuses={renderKeyStatuses}
          keyStatuses={keyboard.statuses}
          onKeyClick={input.handle}
        />
      </footer>

      <div className={styles["landscape-warning"]}>
        The game does not fit on your screen.
        <br />
        Please rotate your device or use a larger display.
      </div>
    </div>
  );
}
