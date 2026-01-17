import { useSettingsContext } from "@/app/contexts/SettingsContext";

import { useSoundPlayer } from "@/hooks/useSoundPlayer";

import styles from "@/styles/components/ButtonGroup.module.css";

/**
 * Represents a single slectable button option in a ButtonGroup
 */
interface ButtonOption<T> {
  label: string;
  value: T;
}

/**
 * Props for the ButtonGroup component.
 */
interface ButtonGroupProps<T> {
  options: ButtonOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/**
 * ButtonGroup component.
 *
 * Renders a group of buttons with one selected option at a time.
 */
const ButtonGroup = <T,>({
  options,
  selected,
  onSelect,
}: ButtonGroupProps<T>) => {
  const { volume, isMuted } = useSettingsContext();
  const playKeySound = useSoundPlayer(
    ["/sounds/key_01.mp3", "/sounds/key_02.mp3"],
    isMuted.value ? 0 : volume.value,
  );

  return (
    <div className={styles["button-group"]}>
      {options.map((option) => {
        const isActive = option.value === selected;

        return (
          <button
            key={String(option.value)}
            className={`${styles["button-group__button"]} ${
              isActive ? styles["button-group__button--active"] : ""
            }`}
            onClick={() => {
              onSelect(option.value);
              playKeySound();
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ButtonGroup;
