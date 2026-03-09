import fs from "fs";
import path from "path";

export interface QAArticle {
  post_id: number;
  title: string;
  question: string;
  answer: string | null;
  date: string;
  answer_date: string;
  url: string;
}

const DATA_PATH = path.join(process.cwd(), "data", "articles.json");

let cachedData: QAArticle[] | null = null;

export function loadQAData(): QAArticle[] {
  if (cachedData) return cachedData;
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as QAArticle[];
  cachedData = data.filter((a) => a.answer);
  return cachedData;
}

export function saveQAData(articles: QAArticle[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(articles, null, 2), "utf-8");
  cachedData = null; // 캐시 무효화
}

export function reloadQAData(): QAArticle[] {
  cachedData = null;
  return loadQAData();
}
