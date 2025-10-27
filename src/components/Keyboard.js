import styles from "../styles/Keyboard.module.css";

/**
 * Keyboard component.
 *
 * Renders an on-screen keyboard with status colors for each key.
 *
 * @component
 * @param {Object} props - Component props.
 * @property {Object<string, string>} props.keyStatuses - Mapping of each key to its status.
 * @property {Function} props.onKeyClick - Callback invoked when a key is clicked. Receives the key string.
 * @returns {JSX.Element} The keyboard element.
 */
const Keyboard = ({ keyStatuses, onKeyClick }) => {
  const keyboardLayout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"],
  ];

  return (
    <div className={styles["keyboard"]}>
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className={styles["keyboard__row"]}>
          {row.map((key) => {
            const isWide = key === "Enter" || key === "Backspace";
            const status = keyStatuses[key] || "default";
            return (
              <button
                key={key}
                onClick={() => onKeyClick(key)}
                className={`${styles["keyboard__key"]} ${
                  isWide
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
