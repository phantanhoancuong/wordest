"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useSettingsContext } from "@/app/contexts/SettingsContext";
import { useSettingsUIStore } from "@/store/useSettingsUIStore";

import {
  DEFAULT_UNMUTE_VOLUME,
  AnimationSpeed,
  GameMode,
  SettingsButtonVariant,
  Theme,
  WordLength,
} from "@/lib/constants";

import {
  ActionButton,
  Banner,
  ButtonGroup,
  SettingsItem,
  SettingsSection,
} from "@/components";

import { playVolumePreview } from "@/lib/audio";
import { getVolumeIcon } from "@/lib/volumeIcons";

import ArrowBackIcon from "@/assets/icons/arrow_back_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import ContrastIcon from "@/assets/icons/contrast_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import EyeIcon from "@/assets/icons/visibility_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import PaletteIcon from "@/assets/icons/palette_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import ResetSettingsIcon from "@/assets/icons/reset_settings_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import RulerIcon from "@/assets/icons/straighten_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import SpeedometerIcon from "@/assets/icons/speed_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import StarIcon from "@/assets/icons/star_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import VolumeUpIcon from "@/assets/icons/volume_up_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import styles from "@/app/settings/page.module.css";
import ConfirmDialog from "@/components/ConfirmDialog";

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
    gameMode,
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

  const [openDialog, setOpenDialog] = useState<null | "reset" | "hardcore">(
    null,
  );

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

  const gameModeOptions = [
    { label: "normal", value: GameMode.NORMAL },
    { label: "strict", value: GameMode.STRICT },
    {
      label: "hardcore",
      value: GameMode.HARDCORE,
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

  const isHardcore = gameMode.value === GameMode.HARDCORE;

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
    <div className={styles["app"]}>
      <header className={`${styles["app__banner"]} flex-center`}>
        <Banner
          right={
            <Link href="/">
              <ArrowBackIcon aria-label="Go back to Game" />
            </Link>
          }
        />
      </header>
      <div className={styles["app__content"]}>
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
              Icon={SpeedometerIcon}
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
              name="game mode"
              description={
                <>
                  <strong>Normal</strong> is the classic WORDest experience.
                  <br />
                  <br />
                  <strong>Strict</strong> enforces stricter rules based on
                  previous guesses: letters confirmed in the correct position
                  must remain there, and any revealed letter must be reused at
                  least as many times as it has been confirmed.
                  <br />
                  <br />
                  <strong>Hardcore</strong> applies the same rule as Strict but
                  the reference grid and key statuses for the on-screen keyboard
                  are disabled.
                </>
              }
              control={
                <ButtonGroup
                  options={gameModeOptions}
                  selected={gameMode.value}
                  onSelect={(value) => {
                    if (value === GameMode.HARDCORE) {
                      setOpenDialog("hardcore");
                    } else {
                      gameMode.setValue(value);
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
              name="Accessible color palette"
              description="Use an alternative color palette designed to improve color distinction across the interface for players with color-vision deficiencies."
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
              Icon={ResetSettingsIcon}
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
                  label="resets settings"
                  onClick={() => {
                    setOpenDialog("reset");
                  }}
                />
              }
            />
          </div>
        </SettingsSection>
      </div>

      <div className={styles["landscape-warning"]}>
        The game does not fit on your screen.
        <br />
        Please rotate your device or use a larger display.
      </div>
      <ConfirmDialog
        isOpen={openDialog === "reset"}
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
        isOpen={openDialog === "hardcore"}
        title="Turn on hardcore"
        message="Hardcore has stricter rules and disables all guiding systems, are you sure you want to turn it on?"
        confirmLabel="turn on hardcore"
        onConfirm={() => {
          setOpenDialog(null);
          gameMode.setValue(GameMode.HARDCORE);
        }}
        onCancel={() => setOpenDialog(null)}
      />
    </div>
  );
}
