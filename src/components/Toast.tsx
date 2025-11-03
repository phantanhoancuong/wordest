import { useEffect, useState } from "react";
import styles from "../styles/Toast.module.css";
import { Toast as ToastType } from "../types/toast";
import { UseGameReturn } from "@/types/useGame.types";

interface ToastProps {
  message: ToastType["message"];
  duration: number;
  onClose: () => void;
}

/**
 * Toast component — displays a temporary notification message that fades out automatically.
 */
const Toast = ({ message, duration = 2000, onClose }: ToastProps) => {
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
