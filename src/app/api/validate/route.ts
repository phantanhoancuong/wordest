import { WORD_LISTS, SupportedWordLength } from "@/types/wordList.types";

export async function POST(req: Request) {
  try {
    const { guess, length } = await req.json();
    const lists = WORD_LISTS[length as SupportedWordLength];

    if (!lists) {
      return Response.json({ valid: false }, { status: 400 });
    }

    const valid =
      lists.answers.includes(guess) || lists.allowed.includes(guess);

    if (!valid) {
      return Response.json({ valid: false }, { status: 422 });
    }

    return Response.json({ valid: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
