import styles from "../styles/ToastBar.module.css";
import Toast from "../components/Toast.js";

/**
 * ToastBar component — renders a container that displays multiple toast notifications.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {{ id: number, message: string }[]} props.toasts - Array of toast objects to display.
 * @param {(id: number) => void} props.removeToast - Callback to remove a toast by its ID.
 * @returns {JSX.Element} The rendered toast bar element.
 */
const ToastBar = ({ toasts, removeToast }) => {
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
