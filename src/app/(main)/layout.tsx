import { NavBar } from "@/components/client";

import styles from "@/app/(main)/layout.module.css";

export default function MainLayout({ children }) {
  return (
    <div className={styles["app"]}>
      <header className={styles["app__banner"]}>
        <NavBar />
      </header>
      <main className={`${styles["app__content"]} flex-center`}>
        {children}
      </main>
      <div className={styles["landscape-warning"]}>
        The game does not fit on your screen.
        <br />
        Please rotate your device or use a larger display.
      </div>
    </div>
  );
}
