"use client";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { Ruleset, SessionType } from "@/lib/constants";

import { useActiveSession, useGame } from "@/hooks";

import { Grid, Keyboard, ToastBar } from "@/components/client";

import styles from "@/app/(main)/page.module.css";

/**
 * Main game page component.
 *
 * Responsibilities:
 * - Holds the current {@link GameSession} (e.g. DAILY or PRACTICE).
 * - Forces a full remount of the game tree when the session changes.
 */
export default function Home() {
  const { activeSession } = useActiveSession();

  return <GameRoot key={activeSession} gameSession={activeSession} />;
}

/**
 * Main game UI container.
 *
 * This component renders a game session.
 *
 * Responsibilities:
 * - Invokes {@link useGame} to obtain game statea, input handlers, and render data.
 * - Renders the game grid, optional reference grid, keyboard, toasts, and banner.
 * - Displays session-specific UI.
 * - Provides controls for restarting the game and switching sessions.
 * - Defers rendering until client hydration is complete.
 *
 * Game behavior, validation, animations, and persistence are handled entirely by {@link useGame}.
 *
 * @param gameSession - The active game session type.
 * @returns
 */
function GameRoot({ gameSession }: { gameSession: SessionType }) {
  const { gameGrid, referenceGrid, keyboard, game, toasts, input, render } =
    useGame();

  const { ruleset, showReferenceGrid, showKeyStatuses, wordLength } =
    useSettingsContext();
  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;

  const renderReferenceGrid =
    ruleset.value !== Ruleset.HARDCORE && showReferenceGrid.value;
  const renderKeyStatuses =
    ruleset.value !== Ruleset.HARDCORE && showKeyStatuses.value;

  if (!render.hasHydrated) return null;
  return (
    <div className={styles["home-page__content"]}>
      {game.wordFetchError ? (
        <p className={styles["game__error"]}>{game.wordFetchError}</p>
      ) : (
        <section className={styles["game-board__container"]}>
          <div className={styles["game-board__info"]}>
            <div className={styles["game-board__date"]}>
              {gameSession === SessionType.DAILY
                ? "daily mode (" + date + ")"
                : "practice mode"}
            </div>
            <div className={styles["game-board__ruleset"]}>
              {ruleset.value + " " + wordLength.value + "-letter"}
            </div>
          </div>
          <div className={`${styles["game-board"]}`}>
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
                {gameSession === SessionType.PRACTICE ? (
                  <button
                    className={styles["game-board__button"]}
                    onClick={(e) => {
                      // Typing while the cursor is ontop of the restart button
                      // introduces unexpected behavior.
                      e.currentTarget.blur();
                      game.restartGame();
                    }}
                  >
                    restart
                  </button>
                ) : null}
              </div>
            </div>

            <ToastBar toasts={toasts.list} removeToast={toasts.removeToast} />
          </div>
        </section>
      )}

      {!game.wordFetchError && (
        <footer className={styles["app__keyboard"]}>
          <Keyboard
            renderKeyStatuses={renderKeyStatuses}
            keyStatuses={keyboard.statuses}
            onKeyClick={input.handle}
          />
        </footer>
      )}
    </div>
  );
}
