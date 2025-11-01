import { useEffect, useRef } from "react";

/**
 * Hook to preload and play audio clips.
 *
 * Creates and caches audio elements from given file paths, allowing multiple sounds to overlap when played.
 *
 * @param {string[]} [soundPaths=[]] - Array of sound file URLs to preload.
 * @returns {() => void} Function that plays a random sound from the preloaded list.
 */
export const useSoundPlayer = (soundPaths = []) => {
  const sounds = useRef([]);

  useEffect(() => {
    sounds.current = soundPaths.map((path) => {
      const audio = new Audio(path);
      audio.load();
      return audio;
    });
  }, [soundPaths]);

  /** Plays a random sound from the preloaded list. */
  const play = () => {
    if (!sounds.current.length) return;
    const random = Math.floor(Math.random() * sounds.current.length);
    const sound = sounds.current[random].cloneNode();
    sound.play();
  };

  return play;
};
