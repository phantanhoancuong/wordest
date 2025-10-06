import styles from "../styles/Keyboard.module.css";

const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
];

export default function Keyboard({ keyStatuses, onKeyClick }) {
  return (
    <div className={styles["keyboard"]}>
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className={styles["keyboard-row"]}>
          {row.map((key) => {
            const isWide = key === "Enter" || key === "Backspace";
            const status = keyStatuses[key] || "default";
            return (
              <button
                key={key}
                onClick={() => onKeyClick(key)}
                className={`${styles.key} ${
                  isWide ? styles["key--wide"] : styles["key--narrow"]
                } ${styles[`key--${status}`]}`}
              >
                {key === "Backspace" ? "\u232B" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
