<div align="center">

<img src="web/public/ku-logo.png" alt="Korea University" width="120" />

# 고려대학교 교육대학원 AI 입학 상담 도우미

**Korea University Graduate School of Education — AI Admission Counselor**

과거 Q&A 게시판 2,300+ 건의 공식 답변을 학습한 RAG 기반 AI 챗봇

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Python](https://img.shields.io/badge/Python-3-3776AB?logo=python&logoColor=white)](https://www.python.org/)

</div>

---

## Overview

고려대학교 교육대학원 석사과정 입학 관련 반복 질문에 자동 응답하는 AI 챗봇입니다.

교육대학원 Q&A 게시판의 **2,300건 이상의 공식 답변 데이터**를 크롤링하고, TF-IDF 키워드 검색과 Google Gemini LLM을 결합한 **RAG(Retrieval-Augmented Generation)** 파이프라인으로 정확하고 출처가 명시된 답변을 제공합니다.

<div align="center">
<table>
<tr>
<td align="center"><b>홈페이지</b></td>
<td align="center"><b>AI 챗봇</b></td>
</tr>
<tr>
<td><img src="https://github.com/user-attachments/assets/placeholder-home" alt="Homepage" width="400"/></td>
<td><img src="https://github.com/user-attachments/assets/placeholder-chat" alt="Chatbot" width="400"/></td>
</tr>
</table>
</div>

## Features

- **RAG 기반 답변** — 질문과 관련된 Q&A를 TF-IDF로 검색 후 LLM이 종합하여 답변
- **출처 명시** — 모든 답변에 참고한 게시글 번호와 원문 링크 표시
- **실시간 스트리밍** — SSE(Server-Sent Events)를 활용한 실시간 답변 출력
- **PDF 문서 제공** — 모집요강, 신입생 OT 학사안내, 입시 FAQ PDF 열람
- **반응형 디자인** — 모바일/데스크탑 모두 최적화
- **고려대 브랜딩** — 크림슨 컬러 시스템, 공식 로고 적용

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js API │────▶│  Google Gemini  │
│  (Chat UI)  │◀────│   Route      │◀────│  2.5 Flash      │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────▼───────┐
                    │  TF-IDF      │
                    │  Search      │
                    │  Engine      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Q&A Data    │
                    │  758 articles│
                    │  (JSON)      │
                    └──────────────┘
```

**Data Pipeline:**
```
Q&A 게시판 크롤링 → 데이터 정제 → TF-IDF 인덱싱 → RAG 답변 생성
   (Python)        (Python)      (TypeScript)     (Gemini API)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React, TypeScript, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, Server-Sent Events |
| **AI/LLM** | Google Gemini 2.5 Flash |
| **Search** | Custom TF-IDF (inverted index, Korean tokenization) |
| **Crawler** | Python 3, requests, BeautifulSoup4, lxml |
| **Deploy** | Vercel |

## Project Structure

```
KU/
├── crawler/                    # Python 크롤러
│   ├── crawl_list.py           #   게시글 목록 수집 (2,360건)
│   ├── crawl_detail.py         #   상세 페이지 Q&A 수집
│   ├── clean_data.py           #   데이터 정제 및 필터링
│   └── requirements.txt
│
└── web/                        # Next.js 웹앱
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx        #   홈페이지 (카드 UI)
    │   │   ├── chat/page.tsx   #   챗봇 페이지
    │   │   └── api/chat/       #   RAG API 엔드포인트
    │   ├── components/
    │   │   ├── ChatInterface.tsx  # 채팅 UI (스트리밍)
    │   │   └── HomeCard.tsx       # 카드 컴포넌트
    │   └── lib/
    │       ├── search.ts       #   TF-IDF 검색 엔진
    │       └── qaData.ts       #   Q&A 데이터 로더
    ├── data/
    │   └── articles.json       #   정제된 Q&A 데이터 (758건)
    └── public/
        ├── docs/               #   PDF 문서
        └── ku-logo.png         #   고려대 로고
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Google Gemini API Key ([발급하기](https://aistudio.google.com/apikey))

### Installation

```bash
# 레포지토리 클론
git clone https://github.com/Jeong-Ryeol/ku-edu-chatbot.git
cd ku-edu-chatbot

# 웹앱 의존성 설치
cd web
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 GEMINI_API_KEY 입력

# 개발 서버 실행
npm run dev
```

### Crawler (Optional)

```bash
cd crawler
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 1. 게시글 목록 수집
python crawl_list.py

# 2. 상세 페이지 수집
python crawl_detail.py

# 3. 데이터 정제
python clean_data.py

# 4. 웹앱에 데이터 복사
cp data/articles_clean.json ../web/data/articles.json
```

## How It Works

1. **사용자 질문 수신** — 채팅 UI에서 입학 관련 질문 입력
2. **TF-IDF 검색** — 758건의 Q&A 데이터에서 관련도 상위 7건 추출
3. **컨텍스트 구성** — 검색된 Q&A 원문을 프롬프트에 삽입
4. **LLM 답변 생성** — Gemini가 제공된 데이터만을 기반으로 답변 생성
5. **출처 표시** — 참고한 게시글 번호와 원문 링크 함께 제공

> AI는 제공된 Q&A 데이터에 없는 내용은 답변하지 않으며, 항상 행정실 연락처를 안내합니다.

## License

This project is for educational purposes.

---

<div align="center">
<sub>Built for Korea University Graduate School of Education</sub>
</div>
