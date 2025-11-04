import styles from "../styles/Banner.module.css";
import Image from "next/image";

/**
 * Banner component — displays the game title.
 */
const Banner = () => (
  <div className={styles["banner"]}>
    <Image src="/images/logo.svg" alt="Logo" fill />
  </div>
);

export default Banner;
