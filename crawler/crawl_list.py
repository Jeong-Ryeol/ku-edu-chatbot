"""
고려대학교 교육대학원 입시 Q&A 게시판 - 목록 수집
offset 0 ~ 2350까지 순회하며 게시글 번호/제목/날짜/답변완료 여부 수집
"""

import json
import time
import re
import os
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://edugrad.korea.ac.kr/edugrad/master/master_admission_QnA.do"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_FILE = os.path.join(DATA_DIR, "article_list.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_list_page(offset: int) -> list[dict]:
    """한 페이지(offset)의 게시글 목록을 파싱하여 반환"""
    params = {
        "mode": "list",
        "articleLimit": "10",
        "article.offset": str(offset),
    }
    resp = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")
    articles = []

    # PC용 테이블에서 게시글 행 추출
    rows = soup.select("table.w tr")
    if not rows:
        # fallback: 모든 테이블의 tr
        rows = soup.select("tr")

    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 5:
            continue

        # 번호 (공지사항은 숫자가 아닐 수 있음)
        num_text = cols[0].get_text(strip=True)
        if not num_text.isdigit():
            continue

        # 제목 + articleNo
        link = row.select_one("a.article-title")
        if not link:
            continue

        title = link.get_text(strip=True)
        href = link.get("href", "")
        article_no_match = re.search(r"articleNo=(\d+)", href)
        if not article_no_match:
            continue
        article_no = int(article_no_match.group(1))

        # 답변완료 여부
        has_answer = bool(row.select_one("span.ico_red"))

        # 날짜
        date = cols[4].get_text(strip=True)

        articles.append({
            "article_no": article_no,
            "title": title,
            "date": date,
            "has_answer": has_answer,
        })

    return articles


def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    # 이미 수집된 데이터가 있으면 로드 (중단/재개 지원)
    existing = []
    existing_offsets = set()
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
        # 이미 수집된 article_no로 중복 체크
        existing_offsets = {a["article_no"] for a in existing}
        print(f"기존 데이터 {len(existing)}건 로드됨")

    all_articles = list(existing)
    max_offset = 2360  # 약 236페이지 * 10
    empty_count = 0

    for offset in range(0, max_offset, 10):
        page_num = offset // 10 + 1
        print(f"[{page_num}/{max_offset // 10}] offset={offset} 수집 중...")

        try:
            articles = fetch_list_page(offset)
        except Exception as e:
            print(f"  오류: {e}, 재시도...")
            time.sleep(3)
            try:
                articles = fetch_list_page(offset)
            except Exception as e2:
                print(f"  재시도 실패: {e2}, 건너뜀")
                continue

        if not articles:
            empty_count += 1
            if empty_count >= 3:
                print("연속 3페이지 빈 결과, 종료")
                break
            continue
        else:
            empty_count = 0

        new_count = 0
        for article in articles:
            if article["article_no"] not in existing_offsets:
                all_articles.append(article)
                existing_offsets.add(article["article_no"])
                new_count += 1

        print(f"  {len(articles)}건 파싱, {new_count}건 신규")

        # 10페이지마다 중간 저장
        if page_num % 10 == 0:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(all_articles, f, ensure_ascii=False, indent=2)
            print(f"  중간 저장 완료 (총 {len(all_articles)}건)")

        time.sleep(1.5)  # rate limiting

    # 최종 저장
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_articles, f, ensure_ascii=False, indent=2)

    answered = sum(1 for a in all_articles if a["has_answer"])
    print(f"\n수집 완료: 총 {len(all_articles)}건 (답변완료: {answered}건)")


if __name__ == "__main__":
    main()
