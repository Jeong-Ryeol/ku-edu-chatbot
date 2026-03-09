"use client";

import Link from "next/link";

interface HomeCardProps {
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  badge?: string;
  icon: React.ReactNode;
  accent?: string;
}

export default function HomeCard({
  title,
  description,
  href,
  external = false,
  disabled = false,
  badge,
  icon,
  accent,
}: HomeCardProps) {
  const content = (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
        disabled
          ? "border-gray-200 bg-gray-50/80 cursor-not-allowed"
          : "border-gray-200 bg-white hover:border-[var(--ku-crimson)] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      }`}
    >
      {/* 상단 장식 라인 */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
          disabled
            ? "bg-gray-200"
            : "bg-[var(--ku-crimson)] opacity-0 group-hover:opacity-100"
        }`}
        style={accent && !disabled ? { backgroundColor: accent, opacity: 1 } : {}}
      />

      {badge && (
        <span
          className={`absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            disabled
              ? "bg-gray-200 text-gray-500"
              : "bg-[var(--ku-crimson)]/10 text-[var(--ku-crimson)]"
          }`}
        >
          {badge}
        </span>
      )}

      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 ${
          disabled
            ? "bg-gray-100 text-gray-400"
            : "bg-[var(--ku-crimson)]/5 text-[var(--ku-crimson)] group-hover:bg-[var(--ku-crimson)]/10"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`mb-2 text-lg font-bold ${
          disabled ? "text-gray-400" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed ${
          disabled ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {description}
      </p>

      {/* 화살표 */}
      {!disabled && (
        <div className="mt-4 flex items-center text-sm font-medium text-[var(--ku-crimson)] opacity-0 transition-all duration-300 group-hover:opacity-100">
          {external ? "PDF 열기" : "바로가기"}
          <svg
            className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      )}
    </div>
  );

  if (disabled || !href) return content;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}
