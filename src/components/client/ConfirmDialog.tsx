import styles from "@/styles/components/ConfirmDialog.module.css";

/** Props for the {@link ConfirmDialog} component. */
interface ConfirmDialogProps {
  isOpen: boolean;
  /** Optional title displayed at the top of the dialog. */
  title?: string;
  message: string;
  confirmLabel: string;
  /** Callback fired when the user confirms the action. */
  onConfirm: () => void;
  /** Callback fired when the user cancels or clicks outside the dialog. */
  onCancel: () => void;
}

/**
 * A modal confirmation dialog compoennt.
 *
 * Render an overlay with a panel containing an optional title, a message
 * and a single confirmation button. Clicking the overlay (outside the panel)
 * triggers {@link onCancel}. Clicking inside the panel does not close the dialog
 * unless the confirm button is pressed.
 *
 * Visibility is controlled via the {@link isOpen} prop.
 */
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className={`${styles["confirm-dialog__overlay"]} ${
        isOpen
          ? styles["confirm-dialog--open"]
          : styles["confirm-dialog--closed"]
      }`}
      /** Clicking the overlay cancels the dialog. */
      onClick={onCancel}
    >
      <div
        className={styles["confirm-dialog__panel"]}
        /** Prevent clicks inside the panel from bubbling to the overlay. */
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className={styles["confirm-dialog__title"]}>{title}</h2>
        <p className={styles["confirm-dialog__message"]}>{message}</p>
        <button
          className={styles["confirm-dialog__button"]}
          /** Confirm the action and delegate handling to the parent. */
          onClick={onConfirm}
        >
          <p>{confirmLabel}</p>
        </button>
      </div>
    </div>
  );
}

export default ConfirmDialog;
