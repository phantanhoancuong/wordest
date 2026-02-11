"use client";

import { UseGameReturn } from "@/types/useGame.types";

import styles from "@/styles/components/Keyboard.module.css";

/** Props for the {@link Keyboard} component. */
interface KeyboardProps {
  /** Whether to render per-key status styling. */
  renderKeyStatuses?: boolean;
  /** Map of key labels to their current statuses, provided by the game logic. */
  keyStatuses: UseGameReturn["keyboard"]["statuses"];
  /** Handler invoked when a key is clicked. */
  onKeyClick: UseGameReturn["input"]["handle"];
}

/** Static description of the on-screen keyboard layout.
 *
 * Each row contains a list of keys, where 'unit' represents the relative width
 * of the key compored to a standard key (defaults to 1).
 */
const keyboardLayout = [
  {
    keys: [
      { label: "Q" },
      { label: "W" },
      { label: "E" },
      { label: "R" },
      { label: "T" },
      { label: "Y" },
      { label: "U" },
      { label: "I" },
      { label: "O" },
      { label: "P" },
    ],
  },
  {
    keys: [
      { label: "A" },
      { label: "S" },
      { label: "D" },
      { label: "F" },
      { label: "G" },
      { label: "H" },
      { label: "J" },
      { label: "K" },
      { label: "L" },
    ],
  },
  {
    keys: [
      { label: "Enter", unit: 1.5 },
      { label: "Z" },
      { label: "X" },
      { label: "C" },
      { label: "V" },
      { label: "B" },
      { label: "N" },
      { label: "M" },
      { label: "Backspace", unit: 1.5 },
    ],
  },
];

/**
 * Render the on-screen keyboard used for input.
 *
 * The keyboard layout is defined by {@link keyboardLayout}.
 * Each row is rendered using CSS Grid, with column widths derived from per-key 'unit' values
 * and normalized against the widest row.
 *
 * When {@link renderKeyStatuses} is enabled, each key is styled according to its status from {@link keyStatuses}.
 * Clicking a key forwards its label to {@link onKeyClick}.
 *
 * @param param0
 * @returns
 */
function Keyboard({
  renderKeyStatuses = true,
  keyStatuses,
  onKeyClick,
}: KeyboardProps) {
  /**
   * Compute the maximum total of 'unit' width across all rows.
   * This is used to normalize column widths so rows align visually.
   */
  const maxRowUnit = Math.max(
    ...keyboardLayout.map((row) =>
      row.keys.reduce((sum, key) => sum + (key.unit ?? 1), 0),
    ),
  );

  /** Precompute CSS grid column definitions for each row based on key units. */
  const rows = keyboardLayout.map((row) => ({
    keys: row.keys,
    columns: row.keys
      .map((key) => (key.unit ?? 1) / maxRowUnit + "fr")
      .join(" "),
  }));

  return (
    <div className={styles.keyboard}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={styles.keyboard__row}
          style={{ "--columns": row.columns } as React.CSSProperties}
        >
          {row.keys.map((key) => {
            const status = renderKeyStatuses
              ? keyStatuses[key.label] || "default"
              : "default";

            return (
              <button
                key={key.label}
                data-unit={key.unit ?? 1}
                onClick={() => onKeyClick(key.label)}
                className={`${styles.keyboard__key} ${styles[`keyboard__key--${status}`]}`}
              >
                {key.label === "Backspace" ? "\u232B" : key.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
