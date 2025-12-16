import { useEffect, useRef } from "react";

/**
 * Hook to preload and play audio clips.
 *
 * Creates and caches audio elements from given file paths, allowing multiple sounds to overlap when played.
 *
 * @param soundPaths - Array of sound file URLs to preload.
 * @param volume - Volume level for playback (0.0 to 1.0).
 * @returns Function that plays a random sound from the preloaded list.
 */
export const useSoundPlayer = (
  soundPaths: Array<string> = [],
  volume: number
): (() => void) => {
  const sounds = useRef<Array<HTMLAudioElement>>([]);

  useEffect(() => {
    sounds.current = soundPaths.map((path) => {
      const audio = new Audio(path);
      audio.load();
      return audio;
    });
  }, [soundPaths]);

  /** Plays a random sound from the preloaded list. */
  const play = () => {
    if (sounds.current.length === 0) return;
    const randomIndex = Math.floor(Math.random() * sounds.current.length);
    const audioClone = sounds.current[randomIndex].cloneNode(
      true
    ) as HTMLAudioElement;

    audioClone.volume = volume;

    audioClone.play().catch((err: unknown) => {
      console.error("Error playing audio:", err);
    });
  };

  return play;
};
