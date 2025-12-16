"use client";

import { useState } from "react";
import { Banner, ButtonGroup, SettingsItem } from "../../components";
import { useSettingsContext } from "../contexts/SettingsContext";
import { AnimationSpeed } from "@/lib/constants";
import { playVolumePreview } from "@/lib/audio";
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
  const [draftVolume, setDraftVolume] = useState(volume.value);

  const animationSpeedOptions = [
    { label: "Slow", value: AnimationSpeed.SLOW },
    { label: "Normal", value: AnimationSpeed.NORMAL },
    { label: "Fast", value: AnimationSpeed.FAST },
  ];

  const getVolumeIcon = (v: number) => {
    if (v === 0)
      return "/images/icons/volume_off_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    if (v <= 25)
      return "/images/icons/volume_mute_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    if (v <= 75)
      return "/images/icons/volume_down_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
    return "/images/icons/volume_up_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
  };

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
                  step="5"
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
                  <option value="25" />
                  <option value="50" />
                  <option value="75" />
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
