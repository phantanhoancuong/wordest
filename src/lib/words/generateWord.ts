import "server-only";

import { Ruleset, WordLength } from "@/lib/constants";
import { WORD_LISTS } from "@/types/wordList.types";

import { getDaysSinceEpoch } from "@/lib/utils";

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

export function generateDailyWord(ruleset: Ruleset, wordLength: WordLength) {
  const list = WORD_LISTS[wordLength];

  if (!list || list.answers.length === 0)
    throw new Error(`Invalid word length: ${wordLength}`);

  const dateIndex = getDaysSinceEpoch();
  const answersLength = list.answers.length;
  const cycleIndex = Math.floor(dateIndex / answersLength);
  const wordIndex = dateIndex % answersLength;

  const seedBase = `${cycleIndex} ${ruleset} ${wordLength}`;
  let seed = 0;
  for (let i = 0; i < seedBase.length; i++)
    seed = (seed * 31 + seedBase.charCodeAt(i)) >>> 0;

  const rng = mulberry32(seed);
  const shuffledList = [...list.answers];

  for (let i = shuffledList.length - 1; i > 0; --i) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
  }

  return shuffledList[wordIndex];
}

export function generatePracticeWord(wordLength: WordLength) {
  const list = WORD_LISTS[wordLength];

  if (!list || list.answers.length === 0)
    throw new Error(`Invalid word length: ${length}`);

  const randomIndex = Math.floor(Math.random() * list.answers.length);

  return list.answers[randomIndex];
}
