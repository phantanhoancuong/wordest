import allowed_list_5 from "@/data/allowed_list_5.json";
import allowed_list_6 from "@/data/allowed_list_6.json";
import allowed_list_7 from "@/data/allowed_list_7.json";
import answer_list_5 from "@/data/answer_list_5.json";
import answer_list_6 from "@/data/answer_list_6.json";
import answer_list_7 from "@/data/answer_list_7.json";

export const WORD_LISTS = {
  5: {
    allowed: allowed_list_5,
    answers: answer_list_5,
  },
  6: {
    allowed: allowed_list_6,
    answers: answer_list_6,
  },
  7: {
    allowed: allowed_list_7,
    answers: answer_list_7,
  },
};

export type SupportedWordLength = keyof typeof WORD_LISTS;
