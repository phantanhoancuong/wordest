import Link from "next/link";

import styles from "@/styles/Banner.module.css";

import SettingsIcon from "@/assets/icons/settings_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import Logo from "@/assets/icons/logo.svg";
interface BannerProps {
  left?: React.ReactNode | React.ReactNode[];
  right?: React.ReactNode | React.ReactNode[];
}

/**
 * Banner component — displays the game title.
 */
const Banner: React.FC<BannerProps> = ({ left, right }) => {
  const renderIcons = (content?: React.ReactNode | React.ReactNode[]) => {
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
              <Logo
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
};

export default Banner;
