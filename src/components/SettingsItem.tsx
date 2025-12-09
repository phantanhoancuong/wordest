import styles from "../styles/SettingsItem.module.css";

const SettingsItem = ({ name, description, buttons }) => {
  return (
    <div className={styles["settings-item"]}>
      <h3 className={styles["settings-item__name"]}>{name}</h3>
      <div className={styles["settings-item__info"]}>
        <p className={styles["settings-item__description"]}>{description}</p>
        <div className={styles["settings-item__actions"]}>
          {buttons.map((btn, index) => (
            <button
              className={styles["settings-item__button"]}
              key={index}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsItem;
