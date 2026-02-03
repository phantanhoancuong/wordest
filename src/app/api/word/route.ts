import { Ruleset, SessionType } from "@/lib/constants";
import { WORD_LISTS, SupportedWordLength } from "@/types/wordList.types";

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

/**
 * Computes the number of days since the Unix epoch in UTC.
 *
 * @returns The number of whole days since 01-01-1970 (UTC).
 */
const getDateIndex = (): number => {
  const now = new Date();
  const utcToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const utcEpoch = Date.UTC(1970, 0, 1);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((utcToday - utcEpoch) / MS_PER_DAY);
};

/**
 * GET /api/word
 *
 * Returns a target word for the game based on the requested word length and session type.
 *  Behavior:
 * - "practice": Returns a random word each request.
 * - "daily": Returns a deterministic word based on the current UTC day.
 * - Using cycleIndex and wordIndex guarantees all words are used before repeating (per cycle)
 * but each cycle is shuffled differently themselves.
 *
 * @param req - The incoming Request object.
 * @returns A JSON response: { target: string } or { error: string }.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const length = Number(searchParams.get("length")) as SupportedWordLength;
    const sessionType =
      (searchParams.get("session") as SessionType) ?? SessionType.PRACTICE;
    const ruleset = (searchParams.get("ruleset") as Ruleset) ?? Ruleset.NORMAL;

    const lists = WORD_LISTS[length];
    if (!lists || lists.answers.length === 0) {
      return Response.json({ error: "Invalid word length" }, { status: 400 });
    }

    let target: string;

    if (sessionType === "daily") {
      const dateIndex = getDateIndex();
      const cycleIndex = Math.floor(dateIndex / lists.answers.length);
      const wordIndex = dateIndex % lists.answers.length;

      const seedBase = `${cycleIndex}|${length}|${sessionType}|${ruleset}`;
      let seed = 0;
      for (let i = 0; i < seedBase.length; i++)
        seed = (seed * 31 + seedBase.charCodeAt(i)) >>> 0;

      const rng = mulberry32(seed);
      const shuffledList = [...lists.answers];

      for (let i = shuffledList.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
      }

      target = shuffledList[wordIndex];
    } else {
      // practice = random every time
      const randomIndex = Math.floor(Math.random() * lists.answers.length);
      target = lists.answers[randomIndex];
    }

    return Response.json({ target });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
