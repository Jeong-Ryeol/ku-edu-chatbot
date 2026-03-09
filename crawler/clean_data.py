"""
크롤링 데이터 정제
- 답변 없는 글 필터링
- 공지/홍보 필터링
- 공백/특수문자 정제
"""

import json
import re
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
INPUT_FILE = os.path.join(DATA_DIR, "articles_raw.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "articles_clean.json")

# 필터링할 제목 패턴
FILTER_PATTERNS = [
    r"\[홍보\]",
    r"\[공지\]",
    r"\[안내\]",
    r"\[공고\]",
]


def clean_text(text: str) -> str:
    """텍스트 정제"""
    if not text:
        return ""
    # 연속 공백/줄바꿈 정리
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    # 앞뒤 공백 제거
    text = text.strip()
    return text


def should_filter(title: str) -> bool:
    """필터링 대상인지 확인"""
    for pattern in FILTER_PATTERNS:
        if re.search(pattern, title, re.IGNORECASE):
            return True
    return False


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"오류: {INPUT_FILE} 파일이 없습니다. crawl_detail.py를 먼저 실행하세요.")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        articles = json.load(f)

    print(f"원본 데이터: {len(articles)}건")

    cleaned = []
    filtered_no_answer = 0
    filtered_pattern = 0

    for article in articles:
        # 답변 없는 글 제외
        if not article.get("answer"):
            filtered_no_answer += 1
            continue

        # 공지/홍보 제외
        if should_filter(article.get("title", "")):
            filtered_pattern += 1
            continue

        cleaned.append({
            "post_id": article["post_id"],
            "title": clean_text(article.get("title", "")),
            "question": clean_text(article.get("question", "")),
            "answer": clean_text(article.get("answer", "")),
            "date": article.get("date", ""),
            "answer_date": article.get("answer_date", ""),
            "url": article.get("url", ""),
        })

    # post_id 기준 정렬
    cleaned.sort(key=lambda x: x["post_id"], reverse=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"답변 없는 글 제외: {filtered_no_answer}건")
    print(f"공지/홍보 제외: {filtered_pattern}건")
    print(f"최종 정제 데이터: {len(cleaned)}건 → {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
