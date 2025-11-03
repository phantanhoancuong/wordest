import styles from "../styles/Banner.module.css";

/**
 * Banner component — displays the game title.
 */
const Banner = () => (
  <div className={`${styles["banner"]} flex-center`}>
    <h1 className={styles["banner__text"]}>WORDEST</h1>
  </div>
);

export default Banner;
