import { Ruleset, SessionType, WordLength } from "@/lib/constants";
import { WORD_LISTS, SupportedWordLength } from "@/types/wordList.types";

import { getTodayDateIndex } from "@/lib/utils";

/**
 * Creates a seeded PRNG using the Mulberry32 algorithm.
 *
 * Because Math.random() cannot be seeded, this simple algorithm is implemented to ensure
 * the same sequence of numbers given the same seed in the range [0, 1).
 *
 * @param seed - The seed value for the PRNG.
 * @returns A function that returns a PRNG between 0 and 1.
 */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatePracticeWord(wordLength: WordLength) {
  const list = WORD_LISTS[wordLength];

  if (!list || list.answers.length === 0)
    throw new Error(`Invalid word length: ${length}`);

  const randomIndex = Math.floor(Math.random() * list.answers.length);

  return list.answers[randomIndex];
}
