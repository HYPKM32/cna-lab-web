# CNA Lab — 정적 사이트 (GitHub Pages 버전)

`../nextjs`(동적 버전, Directus + MySQL 필요)와 동일한 디자인의 **완전 정적 사이트**입니다.

- 콘텐츠(논문·구성원·세미나)는 **`content/<컬렉션>/*.json`** (1건 = 1파일)
- 비전공자 편집은 **`/admin` (Sveltia CMS)** — GitHub 계정으로 로그인해 폼으로 편집
- 이미지(연구 figure·인물사진)는 **`public/uploads/`** 에 번들 (약 70MB)
- `?type=`·`?year=` 필터는 클라이언트 사이드로 동작
- 논문 PDF(약 860MB)는 용량 제한 때문에 번들하지 않음 — 기본값에선 View 버튼 숨김

## 빌드 파이프라인

```
content/<컬렉션>/*.json ──(prebuild: aggregate-content.mjs)──▶ data/*.json (생성물, git 미추적)
                                                                  │ import
                                                        next build (output: export)
                                                                  ▼
                                                                out/  ──▶ GitHub Pages
```

## 콘텐츠 수정 방법

### A. /admin 웹 편집 (비전공자용 — 권장)
`https://hanyangcna.github.io/cna-lab-web/admin/` 접속 → GitHub 로그인 → 폼 편집 → 저장.
저장 = 저장소 커밋이며, Actions 가 자동으로 재빌드·배포합니다.

**최초 1회 설정 (관리자):**
1. GitHub OAuth App 생성 + [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker 배포
2. `public/admin/config.yml` 의 `base_url` 을 Worker 주소로 교체
3. 편집자들의 GitHub 계정을 저장소 협업자(Write)로 초대
4. `.github/workflows/deploy.yml` 활성화 (`workflow` 스코프 토큰으로 push 필요)

### B. 파일 직접 편집 (개발자용)
`content/` 밑의 JSON 을 직접 수정하고 push. 새 항목은 `id` 없이 만들어도
됩니다(빌드 시 자동 부여). 필드는 기존 DB 스키마와 동일.

### C. Directus 재추출 (대량 갱신)
```bash
docker compose up -d mysql            # CNA_WEB 루트에서
./scripts/export-data.sh              # → data/*.json (임시)
# 이후 content/ 분할은 수동 — 평상시엔 A/B 사용 권장
./scripts/sync-assets.sh              # 인물사진·figure 갱신
```

## 배포

- **자동 (권장)**: `.github/workflows/deploy.yml` — push 시 GitHub Actions 가 빌드·배포
- **수동 (repo 스코프 토큰만 있을 때)**:
  ```bash
  GH_TOKEN=ghp_xxx ./scripts/deploy-ghpages.sh   # gh-pages 브랜치로 직접 배포
  ```

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
│   ├── people/*.json
│   ├── lectures/*.json
│   └── assets.json             ← 논문·세미나 첨부 매핑 (CMS 미관리)
├── data/                       ← 생성물 (prebuild 집계, git 미추적)
├── public/
│   ├── admin/                  ← Sveltia CMS (index.html + config.yml)
│   └── uploads/                ← figure + 인물사진 번들
├── scripts/
│   ├── aggregate-content.mjs   ← content/ → data/ 집계 (prebuild)
│   ├── deploy-ghpages.sh       ← 수동 배포 (gh-pages 브랜치)
│   ├── export-data.sh          ← DB → JSON (대량 재추출용)
│   └── sync-assets.sh          ← 이미지 에셋 선별 복사
├── lib/ · components/ · app/   ← Next.js 앱 (output: export)
└── .github/workflows/deploy.yml
```
