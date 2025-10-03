import styles from "../styles/ToastBar.module.css";
import Toast from "../components/Toast.js";

export default function ToastBar({ toasts, removeToast }) {
  return (
    <div className={styles["toast-bar"]}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          duration={1000}
          onClose={() => removeToast(toast.id)}
        ></Toast>
      ))}
    </div>
  );
}
