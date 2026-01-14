import Image from "next/image";

import ArrowIcon from "@/assets/icons/keyboard_arrow_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

import styles from "@/styles/SettingsSectionHeader.module.css";

interface SettingsSectionHeaderProps {
  title: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SettingsSectionHeader = ({
  title,
  isOpen,
  setIsOpen,
}: SettingsSectionHeaderProps) => {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={styles["settings-section__header"]}
      aria-expanded={isOpen}
    >
      <span
        className={`${styles["icon-wrapper"]} ${isOpen ? styles.open : ""}`}
      >
        <ArrowIcon
          className={styles["icon"]}
          aria-label={isOpen ? "collapse section" : "expand section"}
        />
      </span>
      <span className={styles["settings-section__title"]}>{title}</span>
    </button>
  );
};

export default SettingsSectionHeader;
