import { ComponentType, SVGProps } from "react";

import VolumeOffIcon from "@/assets/icons/volume_off_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import VolumeMuteIcon from "@/assets/icons/volume_mute_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import VolumeDownIcon from "@/assets/icons/volume_down_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import VolumeUpIcon from "@/assets/icons/volume_up_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

/**
 * React component type for SVG-based volume icons.
 * Used to type the icon component returned by {@link getVolumeIcon}.
 */
export type VolumeIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** Return the appropriate volume icon component based on a numeric volume level. */
export const getVolumeIcon = (volume: number): VolumeIconComponent => {
  if (volume === 0) return VolumeOffIcon;
  if (volume <= 33) return VolumeMuteIcon;
  if (volume <= 66) return VolumeDownIcon;
  return VolumeUpIcon;
};
