import { useSettingsContext } from "@/app/contexts/SettingsContext";
import { GameMode } from "@/lib/constants";
import { UseGameReturn } from "@/types/useGame.types";
import styles from "@/styles/components/Keyboard.module.css";

interface KeyboardProps {
  keyStatuses: UseGameReturn["keyboard"]["statuses"];
  onKeyClick: UseGameReturn["input"]["handle"];
}

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

const Keyboard = ({ keyStatuses, onKeyClick }: KeyboardProps) => {
  const { gameMode, showKeyStatuses } = useSettingsContext();

  const maxRowUnit = Math.max(
    ...keyboardLayout.map((row) =>
      row.keys.reduce((sum, key) => sum + (key.unit ?? 1), 0),
    ),
  );

  const rows = keyboardLayout.map((row) => ({
    keys: row.keys,
    columns: row.keys
      .map((key) => (key.unit ?? 1) / maxRowUnit + "fr")
      .join(" "),
  }));

  const showStatus =
    showKeyStatuses.value && gameMode.value !== GameMode.HARDCORE;

  return (
    <div className={styles.keyboard}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={styles.keyboard__row}
          style={{ "--columns": row.columns } as React.CSSProperties}
        >
          {row.keys.map((key) => {
            const status = showStatus
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
};

export default Keyboard;
