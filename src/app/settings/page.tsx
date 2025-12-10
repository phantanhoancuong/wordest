"use client";

import { Banner, SettingsItem } from "../../components";
import styles from "./page.module.css";

export default function SettingsPage() {
  return (
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner />
      </header>
      <div className={styles["app__content"]}>
        <div className={styles["setting__container"]}>
          <SettingsItem
            name="Sound"
            description="Change the volume of sound effects."
            control={<input type="range" min="0" max="100" value="50" />}
          />
        </div>
        <div className={styles["setting__container"]}>
          <SettingsItem
            name="Animation speed"
            description="Change the speed of cell animations."
            control={
              <>
                <button onClick={() => console.log("Slow animation")}>
                  Slow
                </button>
                <button onClick={() => console.log("Normal animation")}>
                  Normal
                </button>
                <button onClick={() => console.log("Fast animation")}>
                  Fast
                </button>
              </>
            }
          />
        </div>
      </div>
      <div className={styles["landscape-warning"]}>
        The game doesn't fit on your screen in this orientation.
        <br />
        Please rotate your device.
      </div>
    </div>
  );
}
