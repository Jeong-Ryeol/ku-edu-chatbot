export interface QAArticle {
  post_id: number;
  title: string;
  question: string;
  answer: string | null;
  date: string;
  answer_date: string;
  url: string;
}

let cachedData: QAArticle[] | null = null;

export function loadQAData(): QAArticle[] {
  if (cachedData) return cachedData;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require("../../data/articles.json") as QAArticle[];
  cachedData = data.filter((a) => a.answer);
  return cachedData;
}
