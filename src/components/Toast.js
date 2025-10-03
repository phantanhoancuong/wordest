import { useEffect, useState } from "react";
import styles from "../styles/Toast.module.css";

export default function Toast({ message, duration = 2000, onClose }) {
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
}
