"use client";

import { useState } from "react";
import Link from "next/link";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { GameSession, Ruleset } from "@/lib/constants";

import { useGame } from "@/hooks/useGame";

import { Grid, Keyboard, ToastBar, Banner } from "@/components";

import CalendarIcon from "@/assets/icons/calendar_today_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import InfinityIcon from "@/assets/icons/all_inclusive_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import SettingsIcon from "@/assets/icons/settings_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

import styles from "@/app/page.module.css";

/**
 * Main game page component.
 *
 * Responsibilities:
 * - Holds the current {@link GameSession} (e.g. DAILY or PRACTICE).
 * - Forces a full remount of the game tree when the session changes.
 */
export default function Home() {
  const [gameSession, setGameSession] = useState(GameSession.DAILY);
  return (
    <GameRoot
      key={gameSession}
      gameSession={gameSession}
      setGameSession={setGameSession}
    />
  );
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
 * @param setGameSession - State setter provided to switch between sessions.
 * @returns
 */
function GameRoot({
  gameSession,
  setGameSession,
}: {
  gameSession: GameSession;
  setGameSession: (gameSession: GameSession) => void;
}) {
  const { gameGrid, referenceGrid, keyboard, game, toasts, input, render } =
    useGame(gameSession);

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
        {gameSession === GameSession.DAILY ? (
          <Banner
            right={[
              <InfinityIcon
                key="practice"
                onClick={() => setGameSession(GameSession.PRACTICE)}
              />,
              <Link key="settings" href="/settings">
                <SettingsIcon />
              </Link>,
            ]}
          />
        ) : (
          <Banner
            right={[
              <CalendarIcon
                key="daily"
                onClick={() => setGameSession(GameSession.DAILY)}
              />,
              <Link key="settings" href="/settings">
                <SettingsIcon />
              </Link>,
            ]}
          />
        )}
      </header>

      <main className={styles["app__content"]}>
        {game.wordFetchError ? (
          <p className={styles["game__error"]}>{game.wordFetchError}</p>
        ) : (
          <section className={styles["game-board__container"]}>
            <div className={styles["game-board__date"]}>
              {gameSession === GameSession.DAILY
                ? "daily mode (" + date + ")"
                : "practice mode"}
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
