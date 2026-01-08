import { WORD_LISTS, SupportedWordLength } from "@/types/wordList.types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const length = Number(searchParams.get("length")) as SupportedWordLength;

    const lists = WORD_LISTS[length];
    if (!lists || lists.answers.length === 0) {
      return Response.json({ error: "Invalid word length" }, { status: 400 });
    }

    const randomIndex = Math.floor(Math.random() * lists.answers.length);
    const target = lists.answers[randomIndex];

    return Response.json({ target });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
