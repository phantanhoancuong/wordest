let volumePreviewAudio: HTMLAudioElement | null = null;

export const playVolumePreview = (volume: number) => {
  if (!volumePreviewAudio) {
    volumePreviewAudio = new Audio("/sounds/key_01.mp3");
    volumePreviewAudio.load();
  }

  volumePreviewAudio.volume = volume;
  volumePreviewAudio.currentTime = 0;
  volumePreviewAudio.play().catch(() => {});
};
