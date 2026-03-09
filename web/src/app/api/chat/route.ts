import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchQA } from "@/lib/search";

const SYSTEM_PROMPT = `당신은 고려대학교 교육대학원 입학 상담 도우미입니다.
아래 제공된 과거 Q&A 게시판의 공식 답변을 기반으로만 답변합니다.

규칙:
1. 답변 시 반드시 출처를 표기합니다: "📌 참고: Q&A 게시판 N번 게시글"
2. 제공된 Q&A에 관련 내용이 없으면 "해당 내용은 Q&A 게시판에서 확인되지 않았습니다. 교육대학원 행정실(02-3290-1378)로 문의해주세요."라고 안내합니다.
3. 추측하지 않습니다. 제공된 데이터에 근거한 답변만 합니다.
4. 친절하고 정중한 어투를 사용합니다.
5. 여러 Q&A를 참고한 경우 각각의 출처를 모두 표기합니다.`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "메시지가 필요합니다." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 관련 Q&A 검색
    const relatedQAs = searchQA(message, 7);

    // 컨텍스트 구성
    let context = "";
    if (relatedQAs.length > 0) {
      context = "=== 관련 Q&A 게시판 데이터 ===\n\n";
      for (const qa of relatedQAs) {
        context += `[게시글 ${qa.post_id}번] (${qa.date})\n`;
        context += `제목: ${qa.title}\n`;
        context += `질문: ${qa.question}\n`;
        context += `답변: ${qa.answer}\n`;
        context += `URL: ${qa.url}\n\n`;
      }
    } else {
      context = "관련된 Q&A 게시판 데이터를 찾지 못했습니다.\n";
    }

    // Gemini API 호출
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    // 대화 히스토리 구성
    const chatHistory = (history || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })
    );

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `시스템 지시사항: ${SYSTEM_PROMPT}` }],
        },
        {
          role: "model",
          parts: [
            {
              text: "네, 고려대학교 교육대학원 입학 상담 도우미로서 Q&A 게시판 데이터를 기반으로 정확하게 답변하겠습니다.",
            },
          ],
        },
        ...chatHistory,
      ],
    });

    const prompt = `${context}\n사용자 질문: ${message}`;

    const result = await chat.sendMessageStream(prompt);

    // 스트리밍 응답
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          // 출처 정보 전송
          if (relatedQAs.length > 0) {
            const sources = relatedQAs.map((qa) => ({
              post_id: qa.post_id,
              title: qa.title,
              url: qa.url,
            }));
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ sources })}\n\n`
              )
            );
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "응답 생성 중 오류가 발생했습니다." })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errMsg = error instanceof Error ? error.message : "";
    if (errMsg.includes("429") || errMsg.includes("quota")) {
      return Response.json(
        { error: "API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
    return Response.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
