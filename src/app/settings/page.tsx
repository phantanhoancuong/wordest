"use client";

import { useEffect, useState } from "react";
import { Banner, ButtonGroup, SettingsItem } from "../../components";
import { useSettingsContext } from "../contexts/SettingsContext";
import { AnimationSpeed } from "@/lib/constants";
import { playVolumePreview } from "@/lib/audio";
import { getVolumeIcon } from "@/lib/volumeIcons";
import Image from "next/image";
import styles from "./page.module.css";

/**
 * Settings page component.
 *
 * This page allows the user to configure game-related preferences that persist through localStorage, including:
 * - Sound volume.
 * - Animation speed
 *
 * Settings values are sourced from {@link useSettingsContext}.
 */
export default function SettingsPage() {
  const { volume, animationSpeed } = useSettingsContext();
  const [draftVolume, setDraftVolume] = useState(volume.value * 100);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setDraftVolume(volume.value * 100);
    setHasHydrated(true);
  }, [volume.value]);

  if (!hasHydrated) return null;

  const animationSpeedOptions = [
    { label: "Slow", value: AnimationSpeed.SLOW },
    { label: "Normal", value: AnimationSpeed.NORMAL },
    { label: "Fast", value: AnimationSpeed.FAST },
  ];

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
            control={
              <>
                <Image
                  alt="Volume icon"
                  src={getVolumeIcon(draftVolume)}
                  width={24}
                  height={24}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="11"
                  list="volume-ticks"
                  value={draftVolume}
                  onChange={(e) => {
                    setDraftVolume(Number(e.target.value));
                  }}
                  onPointerUp={() => {
                    volume.setValue(draftVolume / 100);
                    playVolumePreview(draftVolume / 100);
                  }}
                />
                <datalist id="volume-ticks">
                  <option value="0" />
                  <option value="33" />
                  <option value="66" />
                  <option value="100" />
                </datalist>
              </>
            }
          />
        </div>

        <div className={styles["setting__container"]}>
          <SettingsItem
            name="Animation speed"
            description="Change the speed of cell animations."
            control={
              <ButtonGroup
                options={animationSpeedOptions}
                selected={animationSpeed.value}
                onSelect={animationSpeed.setValue}
              />
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
