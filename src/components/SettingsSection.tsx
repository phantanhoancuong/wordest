import { ReactNode } from "react";

import SettingsSectionHeader from "@/components/SettingsSectionHeader";

import styles from "@/styles/components/SettingsSection.module.css";

/**Props for the {@link SettingsSection} component. */
interface SettingsSectionProps {
  title: string;
  /** Whether the section is currently expanded and its setter. */
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** Content rendered inside the expandable section panel. */
  children: ReactNode;
}

/**
 * Renders a settings section with a header and expandable content area.
 *
 * This header is rendered via {@link SettingsSectionHeader}.
 * The content panel expands the collapses by animationg the CSS grid row size based on {@link isOpen}.
 */
function SettingsSection({
  title,
  isOpen,
  setIsOpen,
  children,
}: SettingsSectionProps) {
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
}

export default SettingsSection;
