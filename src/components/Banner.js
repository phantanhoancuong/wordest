import styles from "../styles/Banner.module.css";
/**
 * Banner component.
 *
 * Displays the game title at the top of the page.
 *
 * @component
 * @returns {JSX.Element} The banner element.
 */
const Banner = () => {
  return (
    <div className={`${styles["banner-header"]} flex-center`}>
      <h1 className={styles["banner-header__text"]}>WORDEST</h1>
    </div>
  );
};

export default Banner;
