import { useEffect, useState } from "react";
import styles from "../styles/Toast.module.css";

/**
 * Toast component.
 *
 * Displays a temporary notification message that fades out automatically.
 *
 * @component
 * @param {Object} props - Component props.
 * @property {string} props.message - The text to display in the toast.
 * @property {number} [props.duration=2000] - Time in milliseconds before the toasts hide.
 * @property {Function} [props.onClose] - Callback invoked after the toast is removed.
 * @returns {JSX.Element} The toast element.
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
      className={`${styles["toast-container"]} ${
        visible ? "" : styles["toast-container--hidden"]
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
