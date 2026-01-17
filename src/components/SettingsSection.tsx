import SettingsSectionHeader from "@/components/SettingsSectionHeader";

import styles from "@/styles/components/SettingsSection.module.css";

const SettingsSection = ({ title, isOpen, setIsOpen, children }) => {
  return (
    <section className={styles["settings-section"]}>
      <SettingsSectionHeader
        title={title}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <div
        className={styles["settings-section__content"]}
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className={styles["settings-section__panel"]}>{children}</div>
      </div>
    </section>
  );
};

export default SettingsSection;
