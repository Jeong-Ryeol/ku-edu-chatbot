import { loadQAData, saveQAData } from "@/lib/qaData";
import { crawlNewArticles } from "@/lib/crawler";
import { resetSearchIndex } from "@/lib/search";

export const maxDuration = 300;

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const existing = loadQAData();
        const existingIds = new Set(existing.map((a) => a.post_id));
        const beforeCount = existing.length;

        send({ type: "status", message: `기존 데이터: ${beforeCount}건` });

        const newArticles = await crawlNewArticles(existingIds, (msg) => {
          send({ type: "progress", message: msg });
        });

        if (newArticles.length > 0) {
          const allData = [...existing, ...newArticles];
          saveQAData(allData);
          resetSearchIndex();

          send({
            type: "done",
            message: `동기화 완료! ${newArticles.length}건 추가됨`,
            before: beforeCount,
            after: allData.length,
            added: newArticles.length,
          });
        } else {
          send({
            type: "done",
            message: "새로운 답변이 없습니다. 이미 최신 상태입니다.",
            before: beforeCount,
            after: beforeCount,
            added: 0,
          });
        }
      } catch (error) {
        send({
          type: "error",
          message: `동기화 오류: ${error}`,
        });
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
