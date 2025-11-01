import { useEffect, useState } from "react";
import styles from "../styles/Toast.module.css";

/**
 * Toast component — displays a temporary notification message that fades out automatically.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.message - The text to display in the toast.
 * @param {number} [props.duration=2000] - Time in milliseconds before the toast starts hiding.
 * @param {() => void} [props.onClose] - Callback invoked after the toast is fully removed.
 * @returns {JSX.Element} The rendered toast element.
 */
const Toast = ({ message, duration = 2000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), duration);
    const removeTimer = setTimeout(() => onClose?.(), duration + 300);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`${styles.toast} ${visible ? "" : styles["toast--hidden"]}`}
    >
      {message}
    </div>
  );
};

export default Toast;
