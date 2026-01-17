import styles from "@/styles/components/SettingsItem.module.css";

interface SettingsItemProps {
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  name: string;
  description: React.ReactNode;
  control: React.ReactNode;
}

/**
 * Renders a labeled settings row with a description and controls like buttons, sliders, etc.
 */
const SettingsItem = ({
  Icon,
  name,
  description,
  control,
}: SettingsItemProps) => {
  return (
    <div className={styles["settings-item"]}>
      <div className={styles["settings-item__header"]}>
        {Icon && <Icon aria-hidden className={styles["settings-item__icon"]} />}
        <h3 className={styles["settings-item__name"]}>{name}</h3>
      </div>
      <div className={styles["settings-item__info"]}>
        <p className={styles["settings-item__description"]}>{description}</p>
        <div className={styles["settings-item__actions"]}>{control}</div>
      </div>
    </div>
  );
};

export default SettingsItem;
