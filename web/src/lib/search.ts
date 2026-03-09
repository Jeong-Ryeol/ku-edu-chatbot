import { QAArticle, loadQAData } from "./qaData";

// 한국어 불용어
const STOP_WORDS = new Set([
  "이", "그", "저", "것", "수", "등", "및", "를", "을", "에", "의",
  "가", "은", "는", "로", "으로", "에서", "와", "과", "도", "만",
  "까지", "부터", "에게", "한테", "께", "보다", "처럼", "같이",
  "하다", "되다", "있다", "없다", "않다", "이다", "아니다",
  "합니다", "됩니다", "있습니다", "없습니다", "입니다",
  "안녕하세요", "감사합니다", "문의", "질문", "궁금",
  "the", "a", "an", "is", "are", "was", "were",
]);

interface TFIDFIndex {
  documents: { article: QAArticle; terms: Map<string, number> }[];
  idf: Map<string, number>;
}

let index: TFIDFIndex | null = null;

function tokenize(text: string): string[] {
  // 공백 + 특수문자 기준 분리, 2글자 이상만
  return text
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function buildIndex(): TFIDFIndex {
  const articles = loadQAData();
  const documents: TFIDFIndex["documents"] = [];
  const docFreq = new Map<string, number>();

  for (const article of articles) {
    const text = `${article.title} ${article.question} ${article.answer || ""}`;
    const tokens = tokenize(text);
    const termFreq = new Map<string, number>();

    for (const token of tokens) {
      termFreq.set(token, (termFreq.get(token) || 0) + 1);
    }

    // 정규화
    const maxFreq = Math.max(...termFreq.values(), 1);
    const normalized = new Map<string, number>();
    for (const [term, freq] of termFreq) {
      normalized.set(term, freq / maxFreq);
    }

    // 문서 빈도 업데이트
    for (const term of termFreq.keys()) {
      docFreq.set(term, (docFreq.get(term) || 0) + 1);
    }

    documents.push({ article, terms: normalized });
  }

  // IDF 계산
  const idf = new Map<string, number>();
  const N = documents.length;
  for (const [term, df] of docFreq) {
    idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
  }

  return { documents, idf };
}

export function searchQA(query: string, topK: number = 5): QAArticle[] {
  if (!index) {
    index = buildIndex();
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scores: { article: QAArticle; score: number }[] = [];

  for (const doc of index.documents) {
    let score = 0;
    for (const token of queryTokens) {
      const tf = doc.terms.get(token) || 0;
      const idfVal = index.idf.get(token) || 1;
      score += tf * idfVal;
    }
    if (score > 0) {
      scores.push({ article: doc.article, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map((s) => s.article);
}
