import * as cheerio from "cheerio";
import { QAArticle } from "./qaData";

const BASE_URL =
  "https://edugrad.korea.ac.kr/edugrad/master/master_admission_QnA.do";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

interface ListItem {
  article_no: number;
  title: string;
  date: string;
  has_answer: boolean;
}

/** 목록 페이지 하나를 파싱하여 게시글 정보 추출 */
export async function fetchListPage(offset: number): Promise<ListItem[]> {
  const url = `${BASE_URL}?mode=list&articleLimit=10&article.offset=${offset}`;
  const resp = await fetch(url, { headers: HEADERS });
  const html = await resp.text();
  const $ = cheerio.load(html);

  const items: ListItem[] = [];

  $("table tbody tr").each((_, row) => {
    const tds = $(row).find("td");
    if (tds.length < 5) return;

    const titleLink = $(tds[1]).find("a.article-title");
    if (!titleLink.length) return;

    const href = titleLink.attr("href") || "";
    const match = href.match(/articleNo=(\d+)/);
    if (!match) return;

    const articleNo = parseInt(match[1], 10);
    const title = titleLink.text().trim();
    const date = $(tds[3]).text().trim();
    const hasAnswer = $(tds[4]).find("span.ico_red").length > 0;

    items.push({
      article_no: articleNo,
      title,
      date,
      has_answer: hasAnswer,
    });
  });

  return items;
}

/** 상세 페이지에서 질문/답변 추출 */
export async function fetchDetail(
  articleNo: number
): Promise<QAArticle | null> {
  const url = `${BASE_URL}?mode=view&articleNo=${articleNo}&article.offset=0&articleLimit=10`;
  const resp = await fetch(url, { headers: HEADERS });
  const html = await resp.text();
  const $ = cheerio.load(html);

  const viewBlocks = $("div.t_view");
  if (viewBlocks.length === 0) return null;

  const result: QAArticle = {
    post_id: articleNo,
    title: "",
    question: "",
    answer: null,
    date: "",
    answer_date: "",
    url,
  };

  // 질문 블록
  const qBlock = $(viewBlocks[0]);
  const titleTh = qBlock.find("th").filter((_, el) =>
    $(el).text().includes("제목")
  );
  if (titleTh.length) {
    const titleTd = titleTh.next("td");
    if (titleTd.length) result.title = titleTd.text().trim();
  }

  const qContent = qBlock.find("div.fr-view");
  if (qContent.length) {
    result.question = qContent.text().trim().replace(/\s+/g, " ");
  }

  const dateTh = qBlock.find("th").filter((_, el) =>
    $(el).text().includes("등록일")
  );
  if (dateTh.length) {
    const dateTd = dateTh.next("td");
    if (dateTd.length) result.date = dateTd.text().trim();
  }

  // 답변 블록
  if (viewBlocks.length >= 2) {
    const aBlock = $(viewBlocks[1]);

    const aDateTh = aBlock.find("th").filter((_, el) =>
      $(el).text().includes("등록일")
    );
    if (aDateTh.length) {
      const aDateTd = aDateTh.next("td");
      if (aDateTd.length) result.answer_date = aDateTd.text().trim();
    }

    const aContent = aBlock.find("div.fr-view");
    if (aContent.length) {
      result.answer = aContent.text().trim().replace(/\s+/g, " ");
    }
  }

  return result;
}

/** 새 게시글을 크롤링하여 반환 */
export async function crawlNewArticles(
  existingIds: Set<number | string>,
  onProgress?: (msg: string) => void
): Promise<QAArticle[]> {
  const newArticles: QAArticle[] = [];
  let consecutiveExisting = 0;

  for (let offset = 0; offset < 2400; offset += 10) {
    onProgress?.(`목록 페이지 ${offset / 10 + 1} 조회 중...`);

    const items = await fetchListPage(offset);
    if (items.length === 0) break;

    let allExist = true;
    for (const item of items) {
      if (!item.has_answer) continue;
      if (existingIds.has(item.article_no)) continue;

      allExist = false;
      onProgress?.(`새 게시글 발견: ${item.title}`);

      try {
        const detail = await fetchDetail(item.article_no);
        if (detail && detail.answer) {
          newArticles.push(detail);
          onProgress?.(`수집 완료: ${item.title} (답변 ${detail.answer.length}자)`);
        }
      } catch (e) {
        onProgress?.(`오류: ${item.article_no} - ${e}`);
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    if (allExist) {
      consecutiveExisting++;
      if (consecutiveExisting >= 3) {
        onProgress?.("새 게시글이 더 이상 없습니다.");
        break;
      }
    } else {
      consecutiveExisting = 0;
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  return newArticles;
}
