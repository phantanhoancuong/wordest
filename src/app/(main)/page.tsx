"use client";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { Ruleset, SessionType } from "@/lib/constants";

import { useActiveSession, useGame } from "@/hooks";

import { Grid, Keyboard, ToastBar } from "@/components/client";

import { ReplayIcon } from "@/assets/icons";

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

  const renderReferenceGrid =
    ruleset.value !== Ruleset.HARDCORE && showReferenceGrid.value;
  const renderKeyStatuses =
    ruleset.value !== Ruleset.HARDCORE && showKeyStatuses.value;
  const modeSummmaryString =
    gameSession + "." + ruleset.value + "." + wordLength.value;
  if (!render.hasHydrated) return null;
  return (
    <div className={styles["home-page__content"]}>
      {game.wordFetchError ? (
        <p className={styles["game__error"]}>{game.wordFetchError}</p>
      ) : (
        <section className={styles["game-board__container"]}>
          <div className={`${styles["game-board"]}`}>
            <div className={styles["game-board__stack"]}>
              <div className={styles["game-board__controls"]}>
                <button className={styles["game-board__summary"]}>
                  {modeSummmaryString}
                </button>

                {gameSession === SessionType.PRACTICE ? (
                  <button
                    type="button"
                    className={styles["game-board__restart"]}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      game.restartGame();
                    }}
                    aria-label="Restart game"
                  >
                    <ReplayIcon />
                  </button>
                ) : null}
              </div>

              <div className={styles["game-board__grids"]}>
                <div className={styles["game-board__game-grid"]}>
                  <Grid
                    grid={gameGrid.renderGrid}
                    onAnimationEnd={gameGrid.handleAnimationEnd}
                    layoutRows={gameGrid.rowNum}
                    layoutCols={gameGrid.colNum}
                  />
                </div>

                <div className={styles["game-board__reference-grid"]}>
                  {renderReferenceGrid ? (
                    <Grid
                      grid={referenceGrid.renderGrid}
                      onAnimationEnd={referenceGrid.handleAnimationEnd}
                      layoutRows={gameGrid.rowNum}
                      layoutCols={gameGrid.colNum}
                    />
                  ) : null}
                </div>
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
