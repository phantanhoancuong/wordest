import styles from "../styles/ToastBar.module.css";
import Toast from "../components/Toast.js";

/**
 * ToastBar component.
 *
 * Renders a container for multiple toast notifications.
 *
 * @component
 * @param {Object} props - Component.props.
 * @property {Array<{id: number, message: string}>} props.toasts - Array of toast objects to display.
 * @property {Function} props.removeToast - Callback to remove a toast by ID.
 * @returns {JSX.Element} The toast bar element.
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
        ></Toast>
      ))}
    </div>
  );
};

export default ToastBar;
