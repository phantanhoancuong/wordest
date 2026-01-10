import Image from "next/image";

import closedHeaderIcon from "@/assets/icons/keyboard_arrow_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import openedHeaderIcon from "@/assets/icons/keyboard_arrow_down_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import styles from "@/styles/SettingsSectionHeader.module.css";

const SettingsSectionHeader = ({ title, isOpen, setIsOpen }) => {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={styles["settings-section__header"]}
    >
      <span className={styles["icon-wrapper"]}>
        <Image
          src={isOpen ? openedHeaderIcon : closedHeaderIcon}
          alt={isOpen ? "Collapse section" : "Expand section"}
          width={24}
          height={24}
        />
      </span>
      <span className={styles["settings-section__title"]}>{title}</span>
    </button>
  );
};

export default SettingsSectionHeader;
