"use client";

import Link from "next/link";

import { Banner } from "@/components/server";

import { BackArrowIcon } from "@/assets/icons";

import styles from "@/app/stats/page.module.css";

export default function StatsPage() {
  return (
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner
          right={
            <Link href="/">
              <BackArrowIcon aria-label="Go back to Game" />
            </Link>
          }
        />
      </header>
      <div className={styles["app__content"]}>
        <h1 className={styles["wip-disclaimer"]}>
          This page is under development and has not been implemented yet.
        </h1>
      </div>
      <div className={styles["landscape-warning"]}>
        The game does not fit on your screen.
        <br />
        Please rotate your device or use a larger display.
      </div>
    </div>
  );
}
