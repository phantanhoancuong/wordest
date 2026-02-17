import { ComponentType, SVGProps } from "react";

import {
  VolumeDownIcon,
  VolumeMuteIcon,
  VolumeOffIcon,
  VolumeUpIcon,
} from "@/assets/icons";

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
