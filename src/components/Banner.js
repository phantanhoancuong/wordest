import styles from "../styles/Banner.module.css";

/**
 * Banner component — displays the game title.
 *
 * @component
 * @returns {JSX.Element} The rendered banner element.
 */
const Banner = () => (
  <div className={`${styles["banner"]} flex-center`}>
    <h1 className={styles["banner__text"]}>WORDEST</h1>
  </div>
);

export default Banner;
