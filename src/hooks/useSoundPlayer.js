import { useEffect, useRef } from "react";

/**
 * Hook to play audio clips from a list of sound paths.
 *
 * Preloads audio elements and provides a function to play a random sound from the list.
 * Each play clones the audio element to allow overlapping playback.
 *
 * @param {string[]} [soundPaths=[]] - Array of sound file URLs to preload.
 * @returns {Function} play - Function to play a random sound from the preloaded list.
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

  /**
   * Plays a random sound from the preloaded list.
   *
   * Clones the audio element to allow multiple sounds to play simultaneously.
   *
   * @returns {void}
   */
  const play = () => {
    if (!sounds.current.length) return;
    const random = Math.floor(Math.random() * sounds.current.length);
    const sound = sounds.current[random].cloneNode();
    sound.play();
  };

  return play;
};
