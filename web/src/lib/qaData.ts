import fs from "fs";
import path from "path";

export interface QAArticle {
  post_id: number | string;
  title: string;
  question: string;
  answer: string | null;
  date: string;
  answer_date: string;
  url: string;
  source_type?: "qa" | "pdf";
  source_name?: string;
}

const DATA_PATH = path.join(process.cwd(), "data", "articles.json");
const PDF_DATA_PATH = path.join(process.cwd(), "data", "pdf_data.json");

let cachedData: QAArticle[] | null = null;
let cachedAllData: QAArticle[] | null = null;

export function loadQAData(): QAArticle[] {
  if (cachedData) return cachedData;
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as QAArticle[];
  cachedData = data.filter((a) => a.answer);
  return cachedData;
}

export function loadAllData(): QAArticle[] {
  if (cachedAllData) return cachedAllData;
  const qaData = loadQAData();
  let pdfData: QAArticle[] = [];
  try {
    const raw = fs.readFileSync(PDF_DATA_PATH, "utf-8");
    pdfData = JSON.parse(raw) as QAArticle[];
  } catch {}
  cachedAllData = [...qaData, ...pdfData];
  return cachedAllData;
}

export function saveQAData(articles: QAArticle[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(articles, null, 2), "utf-8");
  cachedData = null;
  cachedAllData = null;
}

export function reloadQAData(): QAArticle[] {
  cachedData = null;
  cachedAllData = null;
  return loadQAData();
}
