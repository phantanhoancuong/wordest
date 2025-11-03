import styles from "../styles/Keyboard.module.css";
import { UseGameReturn } from "@/types/useGame.types";

interface KeyboardProps {
  keyStatuses: UseGameReturn["keyboard"]["statuses"];
  onKeyClick: UseGameReturn["input"]["handle"];
}

/**
 * On-screen keyboard component.
 *
 * Displays a clickable keyboard layout with visual feedback for each key's status.
 */
const Keyboard = ({ keyStatuses, onKeyClick }: KeyboardProps) => {
  const layout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  ];

  return (
    <div className={styles.keyboard}>
      {layout.map((row, r) => (
        <div key={r} className={styles.keyboard__row}>
          {row.map((key) => {
            const wide = key === "Enter" || key === "Backspace";
            const status = keyStatuses[key] || "default";
            return (
              <button
                key={key}
                onClick={() => onKeyClick(key)}
                className={`${styles.keyboard__key} ${
                  wide
                    ? styles["keyboard__key--wide"]
                    : styles["keyboard__key--narrow"]
                } ${styles[`keyboard__key--${status}`]}`}
              >
                {key === "Backspace" ? "\u232B" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
