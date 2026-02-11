"use client";

import ArrowIcon from "@/assets/icons/keyboard_arrow_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

import styles from "@/styles/components/SettingsSectionHeader.module.css";

/** Props for the {@link SettingsSectionHeader} component. */
interface SettingsSectionHeaderProps {
  title: string;
  /** Whether the section is currently expanded and its setter. */
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

/**
 * Render a clickable header for a collapsible settings section.
 *
 * Display the section title alongside an arrow icon that rotates the open/closed stataea.
 * Clicking the header toggles the section by calling {@link setIsOpen}.
 */
function SettingsSectionHeader({
  title,
  isOpen,
  setIsOpen,
}: SettingsSectionHeaderProps) {
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
}

export default SettingsSectionHeader;
