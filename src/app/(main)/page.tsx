"use client";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { Ruleset, SessionType } from "@/lib/constants";

import { useActiveSession, useGame } from "@/hooks";

import { Grid, Keyboard, ModeControls, ToastBar } from "@/components/client";

import { ReplayIcon } from "@/assets/icons";

import styles from "@/app/(main)/page.module.css";

/**
 * Main game page component.
 *
 * Renders a complete game including:
 * - Mode states management (session, ruleset, and word length).
 * - Game board with controls and grids.
 * - On-screen keyboard.
 * - Toast notifications.
 *
 * Responsibilities:
 * - Subscribes to the active game session.
 * - Retrieves game state, grid data, keyboard state, and actions through {@link useGame}.
 * - Renders controls for mode switching and game restarting.
 * - Conditionally renders reference grid and key status UI based on settings.
 *
 * Game logic, validation, animations, and persistence are handled inside {@link useGame}.
 *
 * @returns The main game UI for the current mode.
 */
export default function Home() {
  const { activeSession } = useActiveSession();

  const { gameGrid, referenceGrid, keyboard, game, toasts, input, render } =
    useGame();

  const { ruleset, showReferenceGrid, showKeyStatuses } = useSettingsContext();

  const renderReferenceGrid =
    ruleset.value !== Ruleset.HARDCORE && showReferenceGrid.value;
  const renderKeyStatuses =
    ruleset.value !== Ruleset.HARDCORE && showKeyStatuses.value;

  if (!render.hasHydrated) return null;
  if (game.wordFetchError)
    return <p className={styles["game__error"]}>{game.wordFetchError}</p>;
  return (
    <div className={styles["home-page__content"]}>
      <div className={styles["game-board"]}>
        <div className={styles["game-board__controls"]}>
          <ModeControls />
          {activeSession === SessionType.PRACTICE ? (
            <button
              type="button"
              className={styles["game-board__restart"]}
              key={activeSession}
              onClick={(e) => {
                e.currentTarget.blur();
                toasts.addToast("Game restarted!");
                game.restartGame();
              }}
              aria-label="Restart game"
            >
              <ReplayIcon />
            </button>
          ) : null}
        </div>
        <div key={activeSession} className={styles["game-board__grids"]}>
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
      <footer className={styles["app__keyboard"]} key={activeSession}>
        <Keyboard
          renderKeyStatuses={renderKeyStatuses}
          keyStatuses={keyboard.statuses}
          onKeyClick={input.handle}
        />
      </footer>
      <div className={styles["app__toast-bar"]}>
        <ToastBar toasts={toasts.list} removeToast={toasts.removeToast} />
      </div>
    </div>
  );
}
