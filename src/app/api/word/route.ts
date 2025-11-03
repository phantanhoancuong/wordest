import answer_list from "@/data/answer_list.json";

export async function GET() {
  try {
    if (!answer_list || answer_list.length === 0) {
      return Response.json({ error: "No words available" }, { status: 500 });
    }
    const randomIndex = Math.floor(Math.random() * answer_list.length);
    const target = answer_list[randomIndex];

    if (!target) {
      return Response.json({ error: "Failed to pick a word" }, { status: 500 });
    }

    return Response.json({ target });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
