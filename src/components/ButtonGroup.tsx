import styles from "@/styles/ButtonGroup.module.css";

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
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ButtonGroup;
