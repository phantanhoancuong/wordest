import styles from "@/styles/SettingsItem.module.css";

interface SettingsItemProps {
  name: string;
  description: React.ReactNode;
  control: React.ReactNode;
}

/**
 * Renders a labeled settings row with a description and controls like buttons, sliders, etc.
 */
const SettingsItem = ({ name, description, control }: SettingsItemProps) => {
  return (
    <div className={styles["settings-item"]}>
      <h3 className={styles["settings-item__name"]}>{name}</h3>
      <div className={styles["settings-item__info"]}>
        <p className={styles["settings-item__description"]}>{description}</p>
        <div className={styles["settings-item__actions"]}>{control}</div>
      </div>
    </div>
  );
};

export default SettingsItem;
