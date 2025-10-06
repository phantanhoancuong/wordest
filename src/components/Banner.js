import styles from "../styles/Banner.module.css";

export default function Banner() {
  return (
    <div className={`${styles["banner-header"]} flex-center`}>
      <h1 className={styles["banner-header__text"]}>WORDEST</h1>
    </div>
  );
}
