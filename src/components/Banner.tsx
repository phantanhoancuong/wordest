import Image from "next/image";
import Link from "next/link";

import styles from "@/styles/Banner.module.css";

import settingsIcon from "@/assets/icons/settings_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

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
      <div key={index} className={styles["banner__icon"]}>
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
          <div className={styles["banner__logo"]}>
            <Link href="/">
              <Image src="/images/logo.svg" alt="Logo" fill priority />
            </Link>
          </div>
        )}
      </div>

      <div className={styles["banner__right"]}>
        {right ? (
          renderIcons(right)
        ) : (
          <div className={styles["banner__icon"]}>
            <Link href="/settings">
              <Image src={settingsIcon} alt="Settings icon" fill priority />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
