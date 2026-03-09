"use client";

import { useState, useEffect } from "react";

export default function SyncPanel() {
  const [count, setCount] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<{
    added: number;
    after: number;
  } | null>(null);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setCount(data.count);
    } catch {}
  };

  useEffect(() => {
    fetchCount();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setLogs([]);
    setResult(null);

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "progress" || parsed.type === "status") {
              setLogs((prev) => [...prev.slice(-20), parsed.message]);
            }
            if (parsed.type === "done") {
              setResult({ added: parsed.added, after: parsed.after });
              setCount(parsed.after);
              setLogs((prev) => [...prev, parsed.message]);
            }
            if (parsed.type === "error") {
              setLogs((prev) => [...prev, parsed.message]);
            }
          } catch {}
        }
      }
    } catch {
      setLogs((prev) => [...prev, "동기화 중 오류가 발생했습니다."]);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mt-12 rounded-2xl bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--ku-crimson)]/10 text-[var(--ku-crimson)]">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Q&A 데이터베이스
            </h3>
            <p className="text-sm text-gray-500">
              {count !== null ? (
                <>
                  총{" "}
                  <span className="font-bold text-[var(--ku-crimson)]">
                    {count}
                  </span>
                  건의 답변 데이터
                </>
              ) : (
                "불러오는 중..."
              )}
              {result && result.added > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  (+{result.added}건 추가됨)
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
            syncing
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[var(--ku-crimson)] text-white hover:bg-[var(--ku-crimson-dark)]"
          }`}
        >
          <svg
            className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183"
            />
          </svg>
          {syncing ? "동기화 중..." : "새 답변 동기화"}
        </button>
      </div>

      {/* 로그 */}
      {logs.length > 0 && (
        <div className="mt-4 max-h-40 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 p-3">
          {logs.map((log, i) => (
            <p key={i} className="text-xs text-gray-500 py-0.5">
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
