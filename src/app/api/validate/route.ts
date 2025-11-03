import answer_list from "@/data/answer_list.json";
import allowed_list from "@/data/allowed_list.json";

export async function POST(req) {
  try {
    const { guess } = await req.json();

    const valid = answer_list.includes(guess) || allowed_list.includes(guess);

    if (!valid) {
      return Response.json({ valid: false }, { status: 422 });
    }
    return Response.json({ valid: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("Validation error: ", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
