"use client";

import { useState } from "react";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { Ruleset, SessionType } from "@/lib/constants";

import { useActiveSession } from "@/hooks";

import {
  Grid,
  Keyboard,
  ModeControlsButton,
  ModeControlsOverlay,
  ToastBar,
} from "@/components/client";

import { ReplayIcon } from "@/assets/icons";

import styles from "@/app/(main)/page.module.css";

import { useGame } from "@/hooks/useGame";
import { GameState } from "@/lib/constants";

/**
 * Main game page component.
 *
 * Render the complete game interface including the game board, keyboard, mode controls, and toast notifications.
 * Manage visibilitty of the optional UI elements (reference row, key statuses, restart button) based on current session type and user settings.
 *
 * The game remounts when the session type, ruleset, or word length changes via the {@link layoutKey}.
 *
 * Wait for hydration before rendering to prevent SSR/client mismatches.
 *
 * Game logic, validation, animations, and persistence are delegated to {@link useGame}.
 *
 * @returns The main game page UI.
 */
export default function Home() {
  const { activeSession } = useActiveSession();

  const { gameGrid, referenceRow, keyboard, game, toasts, input, render } =
    useGame();

  const { ruleset, showReferenceGrid, showKeyStatuses, wordLength } =
    useSettingsContext();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  /** Force component remount when session, ruleset, or word length changes. */
  const layoutKey = `${activeSession}-${ruleset.value}-${wordLength.value}`;

  const renderReferenceGrid =
    (ruleset.value !== Ruleset.HARDCORE && showReferenceGrid.value) ||
    (game.gameState !== GameState.PLAYING && referenceRow.isRevealing);
  const renderKeyStatuses =
    ruleset.value !== Ruleset.HARDCORE && showKeyStatuses.value;

  if (!render.hasHydrated)
    return <div className={styles["home-page__content"]} />;

  return (
    <div className={styles["home-page__content"]}>
      <div className={styles["game-board"]}>
        <div className={styles["game-board__controls"]}>
          <ModeControlsButton isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
          {activeSession === SessionType.PRACTICE ? (
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
        <div key={`grids-${layoutKey}`} className={styles["game-board__grids"]}>
          <div className={styles["game-board__game-grid"]}>
            <Grid
              grid={gameGrid.grid}
              onAnimationEnd={gameGrid.handleAnimationEnd}
              layoutRows={gameGrid.rowNum}
              layoutCols={gameGrid.colNum}
            />
          </div>
          <div
            className={styles["game-board__reference-grid"]}
            style={{ visibility: renderReferenceGrid ? "visible" : "hidden" }}
          >
            <Grid
              grid={referenceRow.row}
              onAnimationEnd={referenceRow.handleAnimationEnd}
              layoutRows={gameGrid.rowNum}
              layoutCols={gameGrid.colNum}
            />
          </div>
        </div>
      </div>

      <div className={styles["app__keyboard"]} key={`keyboard-${layoutKey}`}>
        <Keyboard
          renderKeyStatuses={renderKeyStatuses}
          keyStatuses={keyboard.statuses}
          onKeyClick={input.handle}
        />
      </div>

      <footer className={styles["app__footer"]}>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </footer>

      <div className={styles["app__toast-bar"]}>
        <ToastBar toasts={toasts.list} removeToast={toasts.removeToast} />
      </div>

      <div className={styles["mode-overlay"]}>
        <ModeControlsOverlay isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      </div>
    </div>
  );
}
