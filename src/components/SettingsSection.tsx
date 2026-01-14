import { useEffect, useRef, useState } from "react";

import SettingsSectionHeader from "@/components/SettingsSectionHeader";

import styles from "@/styles/SettingsSection.module.css";

const SettingsSection = ({ title, isOpen, setIsOpen, children }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  /**
   * The height for the slide-down animation is calculated from contentRef.
   * If the content changes dynamically or the user resizes the viewport, scrollHeight changes.
   *
   * Sets up a ResizeObserver to monitor content size changes, ensure that whenever the content's size changes,
   * we recalculate height and CSS transitions work smoothly.
   */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      if (!contentRef.current) return;
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <section className={styles["settings-section"]}>
      <SettingsSectionHeader
        title={title}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <div
        className={styles["settings-section__content"]}
        ref={contentRef}
        style={{ height: `${height}px` }}
      >
        {children}
      </div>
    </section>
  );
};

export default SettingsSection;
