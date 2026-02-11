"use client";

import { useEffect, useState } from "react";

import { Toast as ToastType } from "@/types/toast";

import styles from "@/styles/components/Toast.module.css";

/** Props for the {@link} Toasts component. */
interface ToastProps {
  message: ToastType["message"];
  /** How long (in milliseconds) the toast stays visible before fading. */
  duration: number;
  /** Callback fired after the toasts has fully disappeared. */
  onClose: () => void;
}

/**
 * Display a temporary notification message that fades out automatically.
 *
 * The toast becomes hidden after {@link duration} milliseconds
 * and is removed shortly after to allow the exit animation to complete.
 */
function Toast({ message, duration = 2000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    /** Timer that triggers the fade-out animation. */
    const hideTimer = setTimeout(() => setVisible(false), duration);
    /** Timer that notifies the parent to remove the toast after the animation. */
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
}

export default Toast;
