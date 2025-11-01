import styles from "../styles/Keyboard.module.css";

/**
 * On-screen keyboard component.
 *
 * Displays a clickable keyboard layout with visual feedback for each key's status.
 *
 * @param {{
 *   keyStatuses: Record<string, string>,
 *   onKeyClick: (key: string) => void
 * }} props - Component props.
 * @returns {JSX.Element} Rendered keyboard element.
 */
const Keyboard = ({ keyStatuses, onKeyClick }) => {
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
