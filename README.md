# CNA Lab — 공식 홈페이지 (정적 사이트)

**https://cna.hanyang.ac.kr** 에서 서비스 중인 한양대 CNA Lab 홈페이지입니다.
Next.js 정적 export 로 빌드되어 GitHub Pages 로 배포되며, 서버·DB 없이 동작합니다.

- **원페이지 구조**: Introduction(통계·하이라이트·연구소개) → Publications → Patents → People → Seminars
  를 한 스크롤에 담고, 상단 탭과 리모콘(퀵 내비)이 각 섹션으로 점프
- 콘텐츠(논문·특허·구성원·세미나)는 **`content/<컬렉션>/*.json`** (1건 = 1파일)
- 비전공자 편집은 **`/admin` (Sveltia CMS)** — GitHub 계정으로 로그인해 폼으로 편집·이미지 업로드
- 이미지(연구 figure·인물사진·CMS 업로드)는 `public/uploads/` 에 번들
- 논문 PDF(약 860MB)는 용량 제한 때문에 번들하지 않음 — 기본값에선 View 버튼 숨김

## 빌드 파이프라인

```
content/<컬렉션>/*.json ──(prebuild: aggregate-content.mjs)──▶ data/*.json (생성물, git 미추적)
                                                                  │ import
                                                        next build (output: export)
                                                                  ▼
                          out/ ──(peaceiris/actions-gh-pages)──▶ gh-pages 브랜치 ──▶ GitHub Pages
```

- 배포 워크플로: `.github/workflows/deploy.yml` — main push 시 자동 빌드 후
  `out/` 을 **gh-pages 브랜치**로 push (Pages 는 legacy 모드로 gh-pages 를 서빙, CNAME 포함)
- 커스텀 도메인: `cna.hanyang.ac.kr` (CNAME + enforce HTTPS)

## 콘텐츠 수정 방법

### A. /admin 웹 편집 (비전공자용 — 권장)
`https://cna.hanyang.ac.kr/admin/` 접속 → GitHub 로그인 → 폼 편집 → 저장.
저장 = 저장소 커밋이며, Actions 가 자동으로 재빌드·배포합니다 (반영까지 2~3분).

컬렉션: 논문(Publications) · 특허(Patents) · 구성원(People) · 세미나(Lectures)
- 논문: 종류(SCI(E) Journal / International Conference / Domestic ...) · 홈 하이라이트 · In-press 체크
- 특허: 국가·등록번호·등록일 + **특허증 사진** 업로드 (카드에 View Certificate 버튼으로 노출)
- 이미지 업로드는 `public/uploads/cms/` 로 커밋됩니다

**최초 1회 설정 (관리자):**
1. GitHub OAuth App 생성 + [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker 배포
2. `public/admin/config.yml` 의 `base_url` 을 Worker 주소로 교체
3. 편집자들의 GitHub 계정을 저장소 협업자(Write)로 초대

### B. 파일 직접 편집 (개발자용)
`content/` 밑의 JSON 을 직접 수정하고 push. 새 항목은 `id` 없이 만들어도
됩니다(빌드 시 자동 부여). 필드는 기존 DB 스키마와 동일.

### C. Directus 재추출 (대량 갱신 — 구 동적 스택 보유 시)
```bash
docker compose up -d mysql            # CNA_WEB 루트에서
./scripts/export-data.sh              # → data/*.json (임시)
./scripts/sync-assets.sh              # 인물사진·figure 갱신
```

## 배포

- **자동 (권장)**: main 에 push → `.github/workflows/deploy.yml` 이 빌드·배포
- **수동 (비상용)**: `GH_TOKEN=... ./scripts/deploy-ghpages.sh` — gh-pages 브랜치로 직접 배포
- CMS 가 수시로 main 에 커밋하므로, 로컬에서 작업했다면 **push 전 rebase** 필수

## 논문 PDF (View 버튼)

PDF 원문 860MB 는 GitHub Pages 1GB 제한 때문에 저장소에 넣지 않았습니다.
외부 https 호스트가 생기면 Actions Variables 의 `PDF_BASE_URL`(또는 빌드 시
`NEXT_PUBLIC_PDF_BASE_URL`)에 오리진을 지정하면 View 버튼이 활성화됩니다.

## 로컬 데모 (docker)

```bash
docker compose up -d --build    # http://<서버IP>:${STATIC_PORT} (.env 참조)
```
데모는 서버의 `../uploads` 를 마운트해 PDF View 버튼까지 동작합니다.

## 구조

```
gitpages/
├── content/                    ← 콘텐츠 원본 (1건 = 1파일, /admin 이 편집)
│   ├── publications/*.json
│   ├── patents/*.json
│   ├── people/*.json
│   ├── lectures/*.json
│   └── assets.json             ← 논문·세미나 첨부 매핑 (CMS 미관리)
├── data/                       ← 생성물 (prebuild 집계, git 미추적)
├── public/
│   ├── admin/                  ← Sveltia CMS (index.html + config.yml)
│   └── uploads/                ← figure + 인물사진 + CMS 업로드(cms/)
├── scripts/
│   ├── aggregate-content.mjs   ← content/ → data/ 집계 (prebuild)
│   ├── deploy-ghpages.sh       ← 수동 배포 (gh-pages 브랜치)
│   ├── export-data.sh          ← DB → JSON (대량 재추출용)
│   └── sync-assets.sh          ← 이미지 에셋 선별 복사
├── app/                        ← Next.js App Router (원페이지: app/page.tsx)
├── components/                 ← *-browser(섹션별 목록·필터), quick-nav(리모콘) 등
├── lib/                        ← data(타입·정렬), labels(표시명), research-meta(연구 파트)
└── .github/workflows/deploy.yml
```
