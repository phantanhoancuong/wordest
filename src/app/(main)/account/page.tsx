"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { authClient } from "@/lib/auth/auth-client";

import {
  Ruleset,
  SessionType,
  SettingsButtonVariant,
  WordLength,
} from "@/lib/constants";

import { useSettingsContext } from "@/app/contexts";

import { PlayerStats } from "@/types/database.types";

import { useActiveSession, usePlayerStatsState } from "@/hooks";

import {
  ActionButton,
  ButtonGroup,
  Distribution,
  SettingsSection,
} from "@/components/client";
import { SettingsItem } from "@/components/server";

import { getRelativeTimeString } from "@/lib/utils";

import { ControllerIcon, RulerIcon, StarIcon } from "@/assets/icons";
import styles from "@/app/(main)/account/page.module.css";

const sessionOptions = [
  { label: "daily", value: SessionType.DAILY },
  { label: "practice", value: SessionType.PRACTICE },
];

const rulesetOptions = [
  { label: "normal", value: Ruleset.NORMAL },
  { label: "strict", value: Ruleset.STRICT },
  {
    label: "hardcore",
    value: Ruleset.HARDCORE,
    variant: SettingsButtonVariant.DANGER,
  },
];

const wordLengthOptions = [
  { label: "5", value: WordLength.FIVE },
  { label: "6", value: WordLength.SIX },
  { label: "7", value: WordLength.SEVEN },
];

export default function AccountPage() {
  const activeSessionController = useActiveSession();
  const settingsContext = useSettingsContext();
  const [session, setSession] = useState<SessionType>(
    activeSessionController.activeSession,
  );
  const [ruleset, setRuleset] = useState<Ruleset>(
    settingsContext.ruleset.value,
  );
  const [wordLength, setWordLength] = useState<WordLength>(
    settingsContext.wordLength.value,
  );

  const [displayedStats, setDisplayedStats] =
    useState<Partial<PlayerStats> | null>(null);

  const { data, isPending } = authClient.useSession();
  const isAnonymous = !data || data.user.isAnonymous;

  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };
  const handleSignIn = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/account",
      errorCallbackURL: "/account",
    });
  };

  const playerStatsState = usePlayerStatsState();

  useEffect(() => {
    playerStatsState
      .fetchPlayerStats(session, ruleset, wordLength)
      .then((stats) => {
        setDisplayedStats(stats);
      });
  }, [session, ruleset, wordLength]);

  const [isStatsOpen, setIsStatsOpen] = useState(true);
  const [isAccountActionsOpen, setIsAccountActionsOpen] = useState(true);

  if (displayedStats === null || isPending) return null;

  return (
    <div className={styles["account-page__scrollbar-wrapper"]}>
      <div className={styles["account-page__content"]}>
        {isAnonymous ? (
          <div className={styles["account-page__sign-in"]}>
            <h1 className={styles["account-page__header"]}>Hello, stranger!</h1>
            <p className={styles["account-page__subheader"]}>
              Sign in to persist your progress and stats across devices.
            </p>
            <button
              className={styles["account-page__sign-in-button"]}
              onClick={handleSignIn}
            >
              Continue with Google
            </button>
          </div>
        ) : (
          <h1 className={styles["account-page__header"]}>
            Hello, {data.user.name}!
          </h1>
        )}

        <SettingsSection
          title="stats"
          isOpen={isStatsOpen}
          setIsOpen={setIsStatsOpen}
        >
          <div className={styles["stats__container"]}>
            <SettingsItem
              Icon={ControllerIcon}
              name="session"
              description="Filter stats by session."
              control={
                <ButtonGroup
                  options={sessionOptions}
                  selected={session}
                  onSelect={(value: SessionType) => setSession(value)}
                />
              }
            />
          </div>
          <div className={styles["stats__container"]}>
            <SettingsItem
              Icon={StarIcon}
              name="ruleset"
              description="Filter stats by ruleset."
              control={
                <ButtonGroup
                  options={rulesetOptions}
                  selected={ruleset}
                  onSelect={(value: Ruleset) => setRuleset(value)}
                />
              }
            />
          </div>
          <div className={styles["stats__container"]}>
            <SettingsItem
              Icon={RulerIcon}
              name="word length"
              description="Filter stats by word length."
              control={
                <ButtonGroup
                  options={wordLengthOptions}
                  selected={wordLength}
                  onSelect={(value: WordLength) => setWordLength(value)}
                />
              }
            />
          </div>
          <div className={styles["stats__container"]}>
            <p className={styles["stats__value"]}>
              Games: {displayedStats.gamesPlayed}
            </p>

            <p className={styles["stats__value"]}>
              Wins / Losses: {displayedStats.gamesWon} /{" "}
              {displayedStats.gamesLost}
            </p>

            <p className={styles["stats__value"]}>
              Win Rate:{" "}
              {displayedStats.gamesPlayed === 0
                ? "0%"
                : (
                    (displayedStats.gamesWon / displayedStats.gamesPlayed) *
                    100
                  ).toFixed(1) + "%"}
            </p>

            <p className={styles["stats__value"]}>
              Current / Max streak: {displayedStats.currentStreak} /{" "}
              {displayedStats.maxStreak}
            </p>

            <p className={styles["stats__value"]}>
              Last Played: {getRelativeTimeString(displayedStats.lastCompleted)}
            </p>
          </div>
          <div className={styles["stats__distribution"]}>
            <p className={styles["stats__header"]}> Guess distribution:</p>
            <Distribution
              distribution={{
                data: [
                  ...displayedStats.guessDistribution,
                  displayedStats.gamesLost,
                ],
                legends: [
                  ...displayedStats.guessDistribution.map((_, i) =>
                    String(i + 1),
                  ),
                  "Lost",
                ],
              }}
            />
          </div>
        </SettingsSection>

        {!isAnonymous && (
          <SettingsSection
            title="account actions"
            isOpen={isAccountActionsOpen}
            setIsOpen={setIsAccountActionsOpen}
          >
            <ActionButton
              danger={true}
              label="sign out"
              onClick={handleSignOut}
            />
          </SettingsSection>
        )}
      </div>
    </div>
  );
}
