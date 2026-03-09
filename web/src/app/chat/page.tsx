import Link from "next/link";
import Image from "next/image";
import ChatInterface from "@/components/ChatInterface";

export const metadata = {
  title: "답변도우미 - 고려대학교 교육대학원",
  description: "고려대학교 교육대학원 입학 Q&A 답변도우미",
};

export default function ChatPage() {
  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* 헤더 */}
      <header className="shrink-0 bg-[var(--ku-crimson)] text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2.5">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-full bg-white p-0.5 shrink-0">
            <Image
              src="/ku-logo.png"
              alt="고려대학교"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold">AI 답변도우미</h1>
            <p className="text-xs text-white/60">
              고려대학교 교육대학원
            </p>
          </div>
        </div>
      </header>

      {/* 챗봇 */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
