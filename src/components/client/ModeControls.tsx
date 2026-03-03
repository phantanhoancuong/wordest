"use client";

import { useState } from "react";

import { useSettingsContext } from "@/app/contexts";

import { Ruleset, SessionType, WordLength } from "@/lib/constants";

import { useActiveSession } from "@/hooks";

import { AccordionArrowIcon } from "@/assets/icons";

import styles from "@/styles/components/ModeControls.module.css";

const sessionOptions = [
  { label: "daily", value: SessionType.DAILY },
  { label: "practice", value: SessionType.PRACTICE },
];

const rulesetOptions = [
  { label: "normal", value: Ruleset.NORMAL },
  { label: "strict", value: Ruleset.STRICT },
  { label: "hardcore", value: Ruleset.HARDCORE },
];

const wordLengthOptions = [
  { label: "five", value: WordLength.FIVE },
  { label: "six", value: WordLength.SIX },
  { label: "seven", value: WordLength.SEVEN },
];

interface ModeButtonProps<T> {
  label: string;
  value: T;
  activeValue: T;
  onSelect: (value: T) => void;
}

function ModeButton<T>({
  label,
  value,
  activeValue,
  onSelect,
}: ModeButtonProps<T>) {
  const isActive = value === activeValue;

  return (
    <button
      className={`${styles["mode-controls__menu-button"]} ${
        isActive ? styles["mode-controls__menu-button--selected"] : ""
      }`}
      onClick={() => onSelect(value)}
    >
      {label}
    </button>
  );
}

function ModeControls() {
  const { ruleset, wordLength } = useSettingsContext();
  const { activeSession, setActiveSession } = useActiveSession();
  const [isOpen, setIsOpen] = useState(false);

  const modeSummaryString =
    activeSession + " · " + ruleset.value + " · " + wordLength.value;

  return (
    <>
      <button
        className={styles["mode-controls__button"]}
        onClick={() => setIsOpen((prev) => !prev)}
        key={activeSession}
      >
        {modeSummaryString}
        <AccordionArrowIcon className={isOpen ? styles["icon--open"] : ""} />
      </button>

      <div
        className={`${styles["mode-controls__overlay"]} ${
          isOpen
            ? styles["mode-controls--open"]
            : styles["mode-controls--closed"]
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={styles["mode-controls__menu"]}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles["mode-controls__menu-section"]}>
            {sessionOptions.map((opt) => (
              <ModeButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                activeValue={activeSession}
                onSelect={setActiveSession}
              />
            ))}
          </div>

          <div className={styles["mode-controls__menu-section"]}>
            {rulesetOptions.map((opt) => (
              <ModeButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                activeValue={ruleset.value}
                onSelect={ruleset.setValue}
              />
            ))}
          </div>

          <div className={styles["mode-controls__menu-section"]}>
            {wordLengthOptions.map((opt) => (
              <ModeButton
                key={opt.value}
                label={opt.label}
                value={opt.value}
                activeValue={wordLength.value}
                onSelect={wordLength.setValue}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ModeControls;
