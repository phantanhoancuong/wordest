"use client";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { useSoundPlayer } from "@/hooks/useSoundPlayer";

import styles from "@/styles/components/ActionButton.module.css";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

/**
 * Renders a single action-oriented button.
 *
 * The visual layout and styling is to match buttons used in {@link ButtonGroup},
 * but does not behave like a selectable option.
 *
 * This component is intended for one-off actions, not for state selection.
 *
 * @param label - Text on the button
 * @param onClick - Function to call when button is clicked.
 * @param danger - Boolean whether or not to style the button as a destructive button.
 * @returns
 */
const ActionButton = ({
  label,
  onClick,
  danger = false,
}: ActionButtonProps) => {
  const { volume, isMuted } = useSettingsContext();
  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    isMuted.value ? 0 : volume.value,
  );

  return (
    <div className={styles["action-button__container"]}>
      <button
        className={[
          // Base styling shared with BUttonGroup buttons.
          styles["action-button__button"],
          // Optional danger styling for destructive actions.
          danger && styles["action-button__button--danger"],
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          onClick();
          playKeySound();
        }}
      >
        {label}
      </button>
    </div>
  );
};

export default ActionButton;
