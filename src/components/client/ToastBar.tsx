"use client";

import { UseGameReturn } from "@/types/useGame.types";

import Toast from "@/components/client/Toast";

import styles from "@/styles/components/ToastBar.module.css";

/** Props for the {@link ToastBar} component. */
interface ToastBarProps {
  /** List of active toasts to render. */
  toasts: UseGameReturn["toasts"]["list"];
  /** Callback used to remove a toast by its id. */
  removeToast: UseGameReturn["toasts"]["removeToast"];
}

/**
 * Render a container that displays multiple toast notifications.
 *
 * Each toast is rendered via the {@link Toast} component and is reponsible for timing its own dismissal.
 * When a toast finishes its exist animation, {@link removeToast} is called to remove it from the list.
 */
function ToastBar({ toasts, removeToast }: ToastBarProps) {
  return (
    <div className={styles["toast-bar"]}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          duration={1000}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastBar;
