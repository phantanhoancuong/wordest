"use client";

import { useState } from "react";

import { useSettingsContext } from "@/app/contexts";

import { Ruleset, SessionType, WordLength } from "@/lib/constants";

import { useActiveSession } from "@/hooks";

import { AccordionArrowIcon } from "@/assets/icons";

import styles from "@/styles/components/ModeControls.module.css";

function ModeControls() {
  const { ruleset, wordLength } = useSettingsContext();
  const { activeSession, setActiveSession } = useActiveSession();
  const [isOpen, setIsOpen] = useState(false);

  const modeSummaryString =
    activeSession + " · " + ruleset.value + " · " + wordLength.value;

  return (
    <>
      <button
        className={styles["mode-summary__button"]}
        onClick={() => setIsOpen(!isOpen)}
        key={activeSession}
      >
        {modeSummaryString}
        <AccordionArrowIcon className={isOpen ? styles["icon--open"] : ""} />
      </button>
      {isOpen && (
        <>
          <div
            className={styles["mode-summary__overlay"]}
            onClick={() => setIsOpen(false)}
          ></div>

          <div
            className={styles["mode-summary__menu"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["mode-summary__menu-section"]}>
              <button onClick={() => setActiveSession(SessionType.DAILY)}>
                daily
              </button>
              <button onClick={() => setActiveSession(SessionType.PRACTICE)}>
                practice
              </button>
            </div>
            <div className={styles["mode-summary__menu-section"]}>
              <button onClick={() => ruleset.setValue(Ruleset.NORMAL)}>
                normal
              </button>
              <button onClick={() => ruleset.setValue(Ruleset.STRICT)}>
                strict
              </button>
              <button onClick={() => ruleset.setValue(Ruleset.HARDCORE)}>
                hardcore
              </button>
            </div>
            <div className={styles["mode-summary__menu-section"]}>
              <button onClick={() => wordLength.setValue(WordLength.FIVE)}>
                five
              </button>
              <button onClick={() => wordLength.setValue(WordLength.SIX)}>
                six
              </button>
              <button onClick={() => wordLength.setValue(WordLength.SEVEN)}>
                seven
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ModeControls;
