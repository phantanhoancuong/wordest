import styles from "@/styles/components/ConfirmDialog.module.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className={`${styles["confirm-dialog__overlay"]} ${
        isOpen
          ? styles["confirm-dialog--open"]
          : styles["confirm-dialog--closed"]
      }`}
      onClick={onCancel}
    >
      <div
        className={styles["confirm-dialog__panel"]}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className={styles["confirm-dialog__title"]}>{title}</h2>
        <p className={styles["confirm-dialog__message"]}>{message}</p>
        <button
          className={styles["confirm-dialog__button"]}
          onClick={onConfirm}
        >
          <p>{confirmLabel}</p>
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;
