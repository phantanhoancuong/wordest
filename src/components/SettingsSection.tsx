import SettingsSectionHeader from "@/components/SettingsSectionHeader";

import styles from "@/styles/SettingsSection.module.css";

const SettingsSection = ({ title, isOpen, setIsOpen, children }) => {
  return (
    <section className={styles["settings-section"]}>
      <SettingsSectionHeader
        title={title}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      {isOpen && (
        <div className={styles["settings-section__content"]}>{children}</div>
      )}
    </section>
  );
};

export default SettingsSection;
