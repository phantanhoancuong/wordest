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

interface ModeControlsButtonProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export function ModeControlsButton({
  isOpen,
  setIsOpen,
}: ModeControlsButtonProps) {
  const { ruleset, wordLength } = useSettingsContext();
  const { activeSession } = useActiveSession();

  const modeSummaryString =
    activeSession + " · " + ruleset.value + " · " + wordLength.value;

  return (
    <button
      className={styles["mode-controls__button"]}
      onClick={() => setIsOpen(!isOpen)}
    >
      {modeSummaryString}
      <AccordionArrowIcon className={isOpen ? styles["icon--open"] : ""} />
    </button>
  );
}

interface ModeControlsOverlayProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export function ModeControlsOverlay({
  isOpen,
  setIsOpen,
}: ModeControlsOverlayProps) {
  const { ruleset, wordLength } = useSettingsContext();
  const { activeSession, setActiveSession } = useActiveSession();

  return (
    <div
      className={`${styles["mode-controls__overlay"]} ${
        isOpen ? styles["mode-controls--open"] : styles["mode-controls--closed"]
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
  );
}
