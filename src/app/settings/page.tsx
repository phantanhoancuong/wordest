"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import styles from "./page.module.css";

import {
  AnimationSpeed,
  GameMode,
  DEFAULT_UNMUTE_VOLUME,
} from "@/lib/constants";

import { Banner, ButtonGroup, SettingsItem } from "@/components";
import { playVolumePreview } from "@/lib/audio";
import { getVolumeIcon } from "@/lib/volumeIcons";

import { useSettingsContext } from "@/app/contexts/SettingsContext";

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
  const { volume, animationSpeed, isMuted, gameMode } = useSettingsContext();

  // Local UI state for the volume slider (0-100)
  // This is decoupled from persisted volume (0-1) to avoid unnecessary writes during dragging.
  // Also to enable mute + persisted volume functionality.
  const [draftVolume, setDraftVolume] = useState(volume.value * 100);

  // Prevents rendering until client hydration completes to avoid mismatches
  const [hasHydrated, setHasHydrated] = useState(false);

  /**
   * Sync the draft slider value with the persisted volume once hydrated.
   */
  useEffect(() => {
    setDraftVolume(volume.value * 100);
    setHasHydrated(true);
  }, [volume.value]);

  if (!hasHydrated) return null;

  const handleVolumeIconClick = () => {
    const nextMuted = !isMuted.value;
    isMuted.setValue(nextMuted);

    // Muting: reflect state in the UI only.
    if (nextMuted) {
      setDraftVolume(0);
      return;
    }

    // Unmuting: restore volume or apply default.
    const nextVolume =
      volume.value === 0 ? DEFAULT_UNMUTE_VOLUME : volume.value;

    if (nextVolume !== volume.value) {
      volume.setValue(nextVolume);
    }

    setDraftVolume(nextVolume * 100);
    playVolumePreview(nextVolume);
  };

  const animationSpeedOptions = [
    { label: "Slow", value: AnimationSpeed.SLOW },
    { label: "Normal", value: AnimationSpeed.NORMAL },
    { label: "Fast", value: AnimationSpeed.FAST },
    { label: "Instant", value: AnimationSpeed.INSTANT },
  ];

  const gameModeOptions = [
    { label: "Normal", value: GameMode.NORMAL },
    { label: "Expert", value: GameMode.EXPERT },
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
                  src={getVolumeIcon(isMuted.value ? 0 : draftVolume)}
                  width={24}
                  height={24}
                  onClick={handleVolumeIconClick}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="11"
                  list="volume-ticks"
                  value={draftVolume}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setDraftVolume(value);

                    // Slider interaction always implies unmute intent
                    if (isMuted.value) isMuted.setValue(false);
                  }}
                  onPointerUp={() => {
                    const newVolume = draftVolume / 100;

                    // Persist volume once on release
                    volume.setValue(newVolume);

                    const shouldMute = newVolume === 0;
                    isMuted.setValue(shouldMute);

                    if (!shouldMute) {
                      playVolumePreview(newVolume);
                    }
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
        <div className={styles["setting__container"]}>
          <SettingsItem
            name="Game mode (WIP)"
            description="Normal mode is the classic WORDest experience. Export requires all future guesses to have correct letters stay in the same position, present letters must be included somewhere, and absent letters cannot be reused (with standard duplicate-letter rules)."
            control={
              <ButtonGroup
                options={gameModeOptions}
                selected={gameMode.value}
                onSelect={gameMode.setValue}
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
