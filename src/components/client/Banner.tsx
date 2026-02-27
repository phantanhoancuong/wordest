"use client";

import Link from "next/link";
import { ReactNode } from "react";

import { LogoLarge } from "@/assets/logos";
import { SettingsIcon } from "@/assets/icons";

import styles from "@/styles/components/Banner.module.css";

/** Props for the {@link Banner} component. */
interface BannerProps {
  /**
   * Optional content to render on the left side of the banner.
   *
   * If not provided, the game logo linking to the home page is shown.
   */
  left?: ReactNode | ReactNode[];

  /**
   * Optional content to render on the right side of the banner.
   *
   * If not provided, a settings icon linking to the settings page is shown.
   */
  right?: ReactNode | ReactNode[];
}

/**
 * Banner component.
 *
 * Displays the game banner with optional left and right content slots.
 * By default, shows the game logo on the right and a settings button on the left.
 */
function Banner({ left, right }: BannerProps) {
  /**
   * Normalize and wrap one or more React nodes in icon containers.
   *
   * @param content - A single React node or an array of nodes to render.
   * @returns An array of wrapped React elements, or null if no content is provided.
   */
  const renderIcons = (
    content?: React.ReactNode | React.ReactNode[],
  ): ReactNode[] | null => {
    if (!content) return null;

    const nodes = Array.isArray(content) ? content : [content];

    return nodes.map((node, index) => (
      <div key={index} className={styles["icon__container"]}>
        {node}
      </div>
    ));
  };

  return (
    <div className={styles["banner"]}>
      <div className={styles["banner__left"]}>
        {left ? (
          renderIcons(left)
        ) : (
          <div className={styles["logo__container"]}>
            <Link href="/">
              <LogoLarge
                className={styles["logo"]}
                aria-label="Logo / Go to Home page"
              />
            </Link>
          </div>
        )}
      </div>

      <div className={styles["banner__right"]}>
        {right ? (
          renderIcons(right)
        ) : (
          <div className={styles["icon__container"]}>
            <Link href="/settings">
              <SettingsIcon
                className={styles["icon"]}
                aria-label="Go to Settings page"
              />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Banner;
