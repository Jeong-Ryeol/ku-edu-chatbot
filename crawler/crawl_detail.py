"""
고려대학교 교육대학원 입시 Q&A 게시판 - 상세 페이지 수집
답변완료된 게시글의 질문/답변 본문을 수집
"""

import json
import time
import os
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://edugrad.korea.ac.kr/edugrad/master/master_admission_QnA.do"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
LIST_FILE = os.path.join(DATA_DIR, "article_list.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "articles_raw.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_detail(article_no: int) -> dict | None:
    """상세 페이지에서 질문/답변 추출"""
    params = {
        "mode": "view",
        "articleNo": str(article_no),
        "article.offset": "0",
        "articleLimit": "10",
    }
    resp = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")

    # t_view 블록들: 첫 번째는 질문, 두 번째(있으면)는 답변
    view_blocks = soup.select("div.t_view")
    if not view_blocks:
        return None

    result = {
        "post_id": article_no,
        "title": "",
        "question": "",
        "answer": None,
        "date": "",
        "answer_date": "",
        "url": f"{BASE_URL}?mode=view&articleNo={article_no}&article.offset=0&articleLimit=10",
    }

    # 질문 블록 (첫 번째 t_view)
    q_block = view_blocks[0]

    # 제목
    title_row = q_block.find("th", string=lambda t: t and "제목" in t)
    if title_row:
        title_td = title_row.find_next_sibling("td")
        if title_td:
            result["title"] = title_td.get_text(strip=True)

    # 질문 본문
    q_content = q_block.select_one("div.fr-view")
    if q_content:
        result["question"] = q_content.get_text(separator="\n", strip=True)

    # 질문 날짜 (목록에서 가져오므로 여기서는 상세 페이지에서 시도)
    date_row = q_block.find("th", string=lambda t: t and "등록일" in t)
    if date_row:
        date_td = date_row.find_next_sibling("td")
        if date_td:
            result["date"] = date_td.get_text(strip=True)

    # 답변 블록 (두 번째 t_view, "답글" 표시 이후)
    if len(view_blocks) >= 2:
        a_block = view_blocks[1]

        # 답변 날짜
        a_date_row = a_block.find("th", string=lambda t: t and "등록일" in t)
        if a_date_row:
            a_date_td = a_date_row.find_next_sibling("td")
            if a_date_td:
                result["answer_date"] = a_date_td.get_text(strip=True)

        # 답변 본문
        a_content = a_block.select_one("div.fr-view")
        if a_content:
            result["answer"] = a_content.get_text(separator="\n", strip=True)

    return result


def main():
    if not os.path.exists(LIST_FILE):
        print(f"오류: {LIST_FILE} 파일이 없습니다. crawl_list.py를 먼저 실행하세요.")
        return

    with open(LIST_FILE, "r", encoding="utf-8") as f:
        article_list = json.load(f)

    # 답변완료된 게시글만
    answered = [a for a in article_list if a["has_answer"]]
    print(f"답변완료 게시글: {len(answered)}건")

    # 이미 수집된 데이터 로드 (중단/재개 지원)
    collected = {}
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
        collected = {a["post_id"]: a for a in existing}
        print(f"기존 수집 데이터: {len(collected)}건")

    total = len(answered)
    for i, article in enumerate(answered):
        article_no = article["article_no"]

        if article_no in collected:
            continue

        print(f"[{i + 1}/{total}] articleNo={article_no} '{article['title']}' 수집 중...")

        try:
            detail = fetch_detail(article_no)
        except Exception as e:
            print(f"  오류: {e}, 재시도...")
            time.sleep(3)
            try:
                detail = fetch_detail(article_no)
            except Exception as e2:
                print(f"  재시도 실패: {e2}, 건너뜀")
                continue

        if detail:
            # 목록에서 가져온 날짜 보완
            if not detail["date"]:
                detail["date"] = article.get("date", "")
            collected[article_no] = detail
            print(f"  질문: {len(detail['question'])}자, 답변: {len(detail['answer']) if detail['answer'] else 0}자")
        else:
            print("  파싱 실패")

        # 50건마다 중간 저장
        if (i + 1) % 50 == 0:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                json.dump(list(collected.values()), f, ensure_ascii=False, indent=2)
            print(f"  중간 저장 ({len(collected)}건)")

        time.sleep(0.5)  # rate limiting

    # 최종 저장
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(list(collected.values()), f, ensure_ascii=False, indent=2)

    with_answer = sum(1 for a in collected.values() if a.get("answer"))
    print(f"\n수집 완료: 총 {len(collected)}건 (답변 있음: {with_answer}건)")


if __name__ == "__main__":
    main()
