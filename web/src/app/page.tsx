import Image from "next/image";
import HomeCard from "@/components/HomeCard";
import SyncPanel from "@/components/SyncPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="bg-[var(--ku-crimson-dark)] text-white/80 text-xs">
        <div className="mx-auto max-w-6xl px-4 py-1.5 flex justify-between items-center">
          <span>고려대학교 교육대학원</span>
          <a
            href="https://edugrad.korea.ac.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            교육대학원 홈페이지 &rarr;
          </a>
        </div>
      </div>

      {/* 메인 헤더 */}
      <header className="relative bg-[var(--ku-crimson)] text-white overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* 로고 */}
            <div className="shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-2 shadow-lg shadow-black/20">
                <Image
                  src="/ku-logo.png"
                  alt="고려대학교 로고"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* 텍스트 */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-sm md:text-base font-light tracking-widest text-white/80">
                  KOREA UNIVERSITY
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                교육대학원
              </h1>
              <p className="mt-2 text-white/70 text-sm md:text-base">
                Graduate School of Education &middot; 석사학위과정 입학 안내
              </p>
            </div>
          </div>
        </div>

        {/* 하단 장식 */}
        <div className="h-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 opacity-80" />
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* 섹션 타이틀 */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">입학 안내</h2>
            <p className="mt-1 text-sm text-gray-500">
              모집요강, 오리엔테이션 자료, 자주 묻는 질문을 확인하세요.
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs text-gray-400">
            2026학년도 전기
          </span>
        </div>

        {/* 카드 그리드 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HomeCard
            title="모집요강"
            description="2026학년도 전기 신입생 모집요강 안내"
            href="/docs/모집요강.pdf"
            external
            badge="PDF"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            }
          />
          <HomeCard
            title="OT 학사안내"
            description="신입생 오리엔테이션 및 학사 안내 자료"
            href="/docs/신입생_OT_학사안내.pdf"
            external
            badge="PDF"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a23.838 23.838 0 0 0-1.012 5.434c0 .043.007.086.017.128a23.89 23.89 0 0 0 5.993 1.972A23.149 23.149 0 0 1 12 15.69a23.149 23.149 0 0 1 4.486 1.441 23.89 23.89 0 0 0 5.993-1.972c.01-.042.017-.085.017-.128a23.84 23.84 0 0 0-1.012-5.434m-15.482 0A24.92 24.92 0 0 1 12 4.458a24.92 24.92 0 0 1 7.74 5.69m-15.482 0c-.348.256-.69.52-1.024.79m16.506-.79c.348.256.69.52 1.024.79M12 2.25c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125S10.875 5.496 10.875 4.875v-1.5c0-.621.504-1.125 1.125-1.125Z"
                />
              </svg>
            }
          />
          <HomeCard
            title="입시 FAQ"
            description="입학 관련 자주 묻는 질문 모음"
            href="/docs/입시_FAQ.pdf"
            external
            badge="PDF"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
            }
          />
          <HomeCard
            title="AI 답변도우미"
            description="Q&A 게시판 기반 AI 입학 상담"
            href="/chat"
            badge="AI"
            icon={
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            }
          />
        </div>

        {/* 데이터베이스 & 동기화 */}
        <SyncPanel />

        {/* 안내 문구 */}
        <div className="mt-5 rounded-2xl bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ku-crimson)]/10 text-[var(--ku-crimson)]">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                안내사항
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI 답변도우미는 과거{" "}
                <a
                  href="https://edugrad.korea.ac.kr/edugrad/master/master_admission_QnA.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--ku-crimson)] hover:underline"
                >
                  Q&A 게시판
                </a>
                의 공식 답변과 모집요강, OT 학사안내, 입시 FAQ 등 공식 PDF
                문서를 함께 참고하여 안내해드립니다. 개발관련 버그나
                질문은 정원렬(
                <span className="font-medium text-gray-700">
                  010-5737-5336
                </span>
                )에게 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/ku-logo.png"
                alt="고려대학교"
                width={36}
                height={36}
                className="opacity-60"
              />
              <div className="text-xs text-gray-400">
                <p className="font-medium text-gray-500">
                  고려대학교 교육대학원
                </p>
                <p>서울특별시 성북구 안암로 145</p>
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center sm:text-right">
              <p>TEL 02-3290-1378</p>
              <p>&copy; Korea University Graduate School of Education</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
