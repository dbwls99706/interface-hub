# Interface Hub

금융사 내부 시스템과 외부 기관(금감원, 제휴사 등) 간 다수 인터페이스를
단일 화면에서 등록·실행·모니터링·재처리·로그 관리하는 중앙화 플랫폼.

지원 프로토콜: REST API, SOAP, MQ, Batch, SFTP/FTP
MVP 범위: REST 실동작 + 나머지 Mock Adapter (확장 구조 증명용)

## Tech Stack

- Next.js 15 App Router (TypeScript, strict)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Realtime)
- Zod (schema validation)
- Recharts (dashboard)
- Vercel (deploy)

## Architecture Principles

- Server Actions 우선, API Route는 필요할 때만
- Adapter 패턴으로 프로토콜 추상화 (lib/adapters/*)
- Supabase Realtime으로 실행 상태 라이브 반영
- UI 컴포넌트는 shadcn 기본 + 커스텀 최소화

## Folder Structure

app/
  (dashboard)/page.tsx         # 대시보드
  interfaces/                  # 인터페이스 관리
    page.tsx                   # 목록
    new/page.tsx               # 생성
    [id]/page.tsx              # 상세/수정
  executions/                  # 실행 이력
    page.tsx
    [id]/page.tsx              # 실행 상세 + 로그
lib/
  adapters/                    # 프로토콜 어댑터
    base.ts
    rest.ts
    soap.ts (mock)
    mq.ts (mock)
    batch.ts (mock)
    sftp.ts (mock)
    registry.ts
  supabase/
    client.ts
    server.ts
  schemas/                     # Zod 스키마
  actions/                     # Server Actions
components/
  ui/                          # shadcn
  interfaces/
  executions/
  dashboard/

## Coding Rules

- TypeScript strict, any 금지 (unknown 사용)
- 함수형 컴포넌트, 화살표 함수
- 에러 처리 필수, try/catch에서 never-throw 보장
- 주석은 한국어 OK, 변수명은 영어
- 폼 검증은 Zod + react-hook-form
- 날짜는 date-fns

## Commit Rules (엄격)

- 한 커밋 = 한 논리 단위
- 제목: Conventional Commits (feat/fix/refactor/chore/docs/style/test)
- 본문: 한국어 OK, 왜(Why)를 중심으로
- Co-authored-by, Generated with, 🤖 이모지, Claude/AI 관련 언급 절대 금지
- 서명 없이 깔끔하게