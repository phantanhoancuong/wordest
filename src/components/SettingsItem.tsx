import styles from "@/styles/components/SettingsItem.module.css";

/** Props for the {@link SettingsItem} component. */
interface SettingsItemProps {
  /** Optional icon component rendered next to the setting name. */
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  description: React.ReactNode;
  /** Control element(s) used to change the setting (e.g., buttons, sliders, toggles, etc.). */
  control: React.ReactNode;
}

/**
 * Renders a labeled settings row with an optional icon, a name, a description,
 * and a control element such as buttons, sliders, or toggles.
 */
function SettingsItem({ Icon, name, description, control }: SettingsItemProps) {
  return (
    <div className={styles["settings-item"]}>
      <div className={styles["settings-item__header"]}>
        {Icon && <Icon aria-hidden className={styles["settings-item__icon"]} />}
        <h3 className={styles["settings-item__name"]}>{name}</h3>
      </div>
      <div className={styles["settings-item__info"]}>
        <div className={styles["settings-item__description"]}>
          {description}
        </div>
        <div className={styles["settings-item__actions"]}>{control}</div>
      </div>
    </div>
  );
}

export default SettingsItem;
