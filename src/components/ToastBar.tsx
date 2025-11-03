import styles from "../styles/ToastBar.module.css";
import Toast from "./Toast";
import { UseGameReturn } from "@/types/useGame.types";

interface ToastBarProps {
  toasts: UseGameReturn["toasts"]["list"];
  removeToast: UseGameReturn["toasts"]["removeToast"];
}

/**
 * ToastBar component — renders a container that displays multiple toast notifications.
 */
const ToastBar = ({ toasts, removeToast }: ToastBarProps) => {
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
};

export default ToastBar;
