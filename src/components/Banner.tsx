import styles from "../styles/Banner.module.css";
import Image from "next/image";
import Link from "next/link";

/**
 * Banner component — displays the game title.
 */
const Banner = () => (
  <div className={styles["banner"]}>
    <div className={styles["banner__left"]}>
      <div className={styles["banner__logo"]}>
        <Image
          src="/images/logo.svg"
          alt="Logo"
          fill
          priority
          onClick={() => (window.location.href = "/")}
        />
      </div>
    </div>
    <div className={styles["banner__right"]}>
      <div className={styles["banner__icon"]}>
        <Link href="/settings">
          <Image
            src="/images/icons/settings_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg"
            alt="Settings icon"
            fill
            priority
          />
        </Link>
      </div>
    </div>
  </div>
);

export default Banner;
