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
            description="Enable or disable game sounds."
            buttons={[
              { label: "On", onClick: () => console.log("Sound On") },
              { label: "Off", onClick: () => console.log("Sound Off") },
            ]}
          />
        </div>
        <div className={styles["setting__container"]}>
          <SettingsItem
            name="Animation speed"
            description="Change the speed of cell animations."
            buttons={[
              { label: "Slow", onClick: () => console.log("Slow animation") },
              {
                label: "Normal",
                onClick: () => console.log("Normal animation"),
              },
              { label: "Fast", onClick: () => console.log("Fast animation") },
            ]}
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
