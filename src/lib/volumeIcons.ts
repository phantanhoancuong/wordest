import VolumeOffIcon from "@/assets/icons/volume_off_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import VolumeMuteIcon from "@/assets/icons/volume_mute_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import VolumeDownIcon from "@/assets/icons/volume_down_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
import VolumeUpIcon from "@/assets/icons/volume_up_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

export type VolumeIconComponent = React.ComponentType<
  React.SVGProps<SVGSVGElement>
>;

export const getVolumeIcon = (volume: number): VolumeIconComponent => {
  if (volume === 0) return VolumeOffIcon;
  if (volume <= 33) return VolumeMuteIcon;
  if (volume <= 66) return VolumeDownIcon;
  return VolumeUpIcon;
};
