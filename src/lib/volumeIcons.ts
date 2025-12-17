import volumeOff from "@/assets/icons/volume_off_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import volumeMute from "@/assets/icons/volume_mute_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import volumeDown from "@/assets/icons/volume_down_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import volumeUp from "@/assets/icons/volume_up_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

export const VOLUME_ICONS = {
  OFF: volumeOff,
  MUTE: volumeMute,
  DOWN: volumeDown,
  UP: volumeUp,
};

export const getVolumeIcon = (volume: number) => {
  if (volume === 0) return VOLUME_ICONS.OFF;
  if (volume <= 25) return VOLUME_ICONS.MUTE;
  if (volume <= 75) return VOLUME_ICONS.DOWN;
  return VOLUME_ICONS.UP;
};
