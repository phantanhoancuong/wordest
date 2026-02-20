import styles from "@/styles/components/OptionsItem.module.css";

function OptionsItem({ Icon, name, control }) {
  return (
    <div className={styles["options-item"]}>
      <div className={styles["options-item__header"]}>
        {Icon && <Icon className={styles["options-item__icon"]} />}
        <h3 className={styles["options-item__name"]}>{name}</h3>
      </div>
      <div className={styles["options-item__action"]}>{control}</div>
    </div>
  );
}

export default OptionsItem;
