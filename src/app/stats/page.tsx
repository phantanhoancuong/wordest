"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Ruleset, SessionType, WordLength } from "@/lib/constants";

import { useSettingsContext } from "@/app/contexts";

import { useActiveSession, usePlayerStatsState } from "@/hooks";

import { ButtonGroup } from "@/components/client";
import { Banner, OptionsItem } from "@/components/server";

import {
  BackArrowIcon,
  ControllerIcon,
  RulerIcon,
  StarIcon,
} from "@/assets/icons";

import styles from "@/app/stats/page.module.css";
import { SettingsButtonVariant } from "@/lib/constants";

import { dateIndexToDateString } from "@/lib/utils";

const sessionOptions = [
  { label: "daily", value: SessionType.DAILY },
  { label: "practice", value: SessionType.PRACTICE },
];

const rulesetOptions = [
  { label: "normal", value: Ruleset.NORMAL },
  {
    label: "strict",
    value: Ruleset.STRICT,
  },
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

export default function StatsPage() {
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

  const playerStatsState = usePlayerStatsState();

  const displayedStats = playerStatsState.getStats(
    session,
    ruleset,
    wordLength,
  );

  return (
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner
          right={
            <Link href="/">
              <BackArrowIcon aria-label="Go back to Game" />
            </Link>
          }
        />
      </header>
      <div className={styles["app__content"]}>
        <div className={styles["app__options"]}>
          <OptionsItem
            Icon={ControllerIcon}
            name="session"
            control={
              <ButtonGroup
                options={sessionOptions}
                selected={session}
                onSelect={(value: SessionType) => setSession(value)}
              />
            }
          />
          <OptionsItem
            Icon={StarIcon}
            name="ruleset"
            control={
              <ButtonGroup
                options={rulesetOptions}
                selected={ruleset}
                onSelect={(value: Ruleset) => setRuleset(value)}
              />
            }
          />
          <OptionsItem
            Icon={RulerIcon}
            name="word length"
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
          <div className={styles["stats__content"]}>
            Games completed: {displayedStats.gamesCompleted}
          </div>
          <div className={styles["stats__content"]}>
            Games won: {displayedStats.gamesWon}
          </div>
          <div className={styles["stats__content"]}>
            Current win streak: {displayedStats.streak}
          </div>
          <div className={styles["stats__content"]}>
            Longest win streak: {displayedStats.maxStreak}
          </div>
          <div className={styles["stats__content"]}>
            Last completed date:{" "}
            {dateIndexToDateString(displayedStats.lastCompletedDateIndex)}
          </div>
          <div className={styles["stats__content"]}>
            Last won date:{" "}
            {dateIndexToDateString(displayedStats.lastWonDateIndex)}
          </div>
        </div>
      </div>
      <div className={styles["landscape-warning"]}>
        The game does not fit on your screen.
        <br />
        Please rotate your device or use a larger display.
      </div>
    </div>
  );
}
