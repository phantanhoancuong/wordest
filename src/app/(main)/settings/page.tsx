"use client";

import { useEffect, useState } from "react";

import { useSettingsContext } from "@/app/contexts/SettingsContext";
import { useSettingsUIStore } from "@/store/useSettingsUIStore";

import {
  DEFAULT_UNMUTE_VOLUME,
  AnimationSpeed,
  Ruleset,
  SettingsButtonVariant,
  Theme,
  WordLength,
} from "@/lib/constants";

import { usePlayerStatsState } from "@/hooks";

import {
  ActionButton,
  ButtonGroup,
  ConfirmDialog,
  SettingsSection,
} from "@/components/client";
import { PreviewGrid, SettingsItem } from "@/components/server";

import { playVolumePreview } from "@/lib/audio";
import { getVolumeIcon } from "@/lib/volumeIcons";

import {
  ContrastIcon,
  TrashCanIcon,
  EyeIcon,
  PaletteIcon,
  ResetIcon,
  RulerIcon,
  SpeedIcon,
  StarIcon,
  VolumeUpIcon,
} from "@/assets/icons";

import styles from "@/app/(main)/settings/page.module.css";

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
  const {
    volume,
    animationSpeed,
    isMuted,
    ruleset,
    wordLength,
    theme,
    showReferenceGrid,
    showKeyStatuses,
    colorAccess,
    resetSettings,
  } = useSettingsContext();

  const isGeneralOpen = useSettingsUIStore((s) => s.isGeneralOpen);
  const isGameplayOpen = useSettingsUIStore((s) => s.isGameplayOpen);
  const isDangerZoneOpen = useSettingsUIStore((s) => s.isDangerZoneOpen);
  const isAccessOpen = useSettingsUIStore((s) => s.isAccessOpen);
  const setIsGeneralOpen = useSettingsUIStore((s) => s.setIsGeneralOpen);
  const setIsGameplayOpen = useSettingsUIStore((s) => s.setIsGameplayOpen);
  const setIsDangerZoneOpen = useSettingsUIStore((s) => s.setIsDangerZoneOpen);
  const setIsAccessOpen = useSettingsUIStore((s) => s.setIsAccessOpen);

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

  const [openDialog, setOpenDialog] = useState<
    null | "settings reset" | "stats delete" | "hardcore"
  >(null);

  const playerStatsState = usePlayerStatsState();

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
    { label: "slow", value: AnimationSpeed.SLOW },
    { label: "normal", value: AnimationSpeed.NORMAL },
    { label: "fast", value: AnimationSpeed.FAST },
    { label: "instant", value: AnimationSpeed.INSTANT },
  ];

  const rulesetOptions = [
    { label: "normal", value: Ruleset.NORMAL },
    { label: "strict", value: Ruleset.STRICT },
    {
      label: "hardcore",
      value: Ruleset.HARDCORE,
      variant: SettingsButtonVariant.DANGER,
    },
  ];

  const wordLengthOptions = [
    { label: "5", value: WordLength.FIVE },
    { label: "6", value: WordLength.SIX },
    { label: "7", value: WordLength.SEVEN },
  ];

  const themeOptions = [
    { label: "light", value: Theme.LIGHT },
    { label: "dark", value: Theme.DARK },
    { label: "system", value: Theme.SYSTEM },
  ];

  const colorAccessOptions = [
    { label: "off", value: false },
    { label: "on", value: true },
  ];

  const isHardcore = ruleset.value === Ruleset.HARDCORE;

  const showReferenceGridOptions = [
    { label: "on", value: true, disabled: isHardcore },
    { label: "off", value: false, disabled: isHardcore },
  ];

  const showKeyStatusesOptions = [
    { label: "on", value: true, disabled: isHardcore },
    { label: "off", value: false, disabled: isHardcore },
  ];

  const VolumeIcon = getVolumeIcon(isMuted.value ? 0 : draftVolume);

  return (
    <div className={styles["settings-page__content"]}>
      <SettingsSection
        title="general"
        isOpen={isGeneralOpen}
        setIsOpen={setIsGeneralOpen}
      >
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={VolumeUpIcon}
            name="volume"
            description="Adjust the volume of game sound effects."
            control={
              <div className={styles["volume-control"]}>
                <VolumeIcon
                  className={styles["volume-icon"]}
                  aria-hidden="true"
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
              </div>
            }
          />
        </div>
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={SpeedIcon}
            name="animation speed"
            description="Control how fast game animations play."
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
            Icon={PaletteIcon}
            name="theme"
            description="Choose the visual theme for the game."
            control={
              <ButtonGroup
                options={themeOptions}
                selected={theme.value}
                onSelect={theme.setValue}
              />
            }
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="gameplay"
        isOpen={isGameplayOpen}
        setIsOpen={setIsGameplayOpen}
      >
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={StarIcon}
            name="ruleset"
            description={
              <>
                <p>
                  <b>Normal</b> is the classic WORDest experience.
                </p>
                <p>
                  <b>Strict</b> adds constraints based on earlier guesses:
                  confirmed letters must stay fixed, and revealed letters must
                  be reused in future guesses.
                </p>
                <p>
                  <b>Hardcore</b> keeps Strict constraints while disabling all
                  visual aids, including the reference grid and keyboard
                  feedback.
                </p>
              </>
            }
            control={
              <ButtonGroup
                options={rulesetOptions}
                selected={ruleset.value}
                onSelect={(value) => {
                  if (value === Ruleset.HARDCORE) {
                    setOpenDialog("hardcore");
                  } else {
                    ruleset.setValue(value);
                  }
                }}
              />
            }
          />
        </div>
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={EyeIcon}
            name="show reference grid"
            description="Display a reference grid showing all confirmed correct letter positions."
            control={
              <ButtonGroup
                options={showReferenceGridOptions}
                selected={showReferenceGrid.value}
                onSelect={showReferenceGrid.setValue}
              />
            }
          />
        </div>
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={EyeIcon}
            name="show keyboard letter statuses"
            description="Display letter status feedback on the keyboard."
            control={
              <ButtonGroup
                options={showKeyStatusesOptions}
                selected={showKeyStatuses.value}
                onSelect={showKeyStatuses.setValue}
              />
            }
          />
        </div>
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={RulerIcon}
            name="word length"
            description="Set how many letters each word contains."
            control={
              <ButtonGroup
                options={wordLengthOptions}
                selected={wordLength.value}
                onSelect={wordLength.setValue}
              />
            }
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="accessibility"
        isOpen={isAccessOpen}
        setIsOpen={setIsAccessOpen}
      >
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={ContrastIcon}
            name="accessible color palette"
            description={
              <>
                Use an alternative color palette designed to improve color
                distinction across the interface for some players with specific
                color-vision deficiencies.
                <PreviewGrid />
              </>
            }
            control={
              <ButtonGroup
                options={colorAccessOptions}
                selected={colorAccess.value}
                onSelect={colorAccess.setValue}
              />
            }
          />
        </div>
      </SettingsSection>
      <SettingsSection
        title="danger zone"
        isOpen={isDangerZoneOpen}
        setIsOpen={setIsDangerZoneOpen}
      >
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={ResetIcon}
            name="reset settings"
            description={
              <>
                Restore all settings to their default values.
                <br />
                This action cannot be undone.
              </>
            }
            control={
              <ActionButton
                danger={true}
                label="reset settings"
                onClick={() => {
                  setOpenDialog("settings reset");
                }}
              />
            }
          />
        </div>
        <div className={styles["setting__container"]}>
          <SettingsItem
            Icon={TrashCanIcon}
            name="delete player statistics"
            description={
              <>
                Permanently delete all accumulated player statistics (games won,
                games completed, win streaks, etc.) across all modes and
                sessions.
                <br />
                This action cannot be undone.
              </>
            }
            control={
              <ActionButton
                danger={true}
                label="delete statistics"
                onClick={() => {
                  setOpenDialog("stats delete");
                }}
              />
            }
          />
        </div>
      </SettingsSection>

      <ConfirmDialog
        isOpen={openDialog === "settings reset"}
        title="Reset settings"
        message="Are you sure you want to reset all your settings?"
        confirmLabel="reset"
        onConfirm={() => {
          setOpenDialog(null);
          resetSettings();
        }}
        onCancel={() => setOpenDialog(null)}
      />
      <ConfirmDialog
        isOpen={openDialog === "stats delete"}
        title="Delete player statistics"
        message="Are you sure you want to permanently delete all accumulated player statistics across all modes and sessions? This action cannot be undone."
        confirmLabel="delete"
        onConfirm={() => {
          setOpenDialog(null);
          playerStatsState.resetAllStats();
        }}
        onCancel={() => setOpenDialog(null)}
      />
      <ConfirmDialog
        isOpen={openDialog === "hardcore"}
        title="Enable Hardcore ruleset"
        message="Hardcore has stricter rules and disables all visual aids. Are you sure you want to turn it on?"
        confirmLabel="turn on hardcore"
        onConfirm={() => {
          setOpenDialog(null);
          ruleset.setValue(Ruleset.HARDCORE);
        }}
        onCancel={() => setOpenDialog(null)}
      />
    </div>
  );
}
