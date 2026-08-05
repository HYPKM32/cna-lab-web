# CNA Lab — 정적 사이트 (GitHub Pages 버전)

`../nextjs`(동적 버전, Directus + MySQL 필요)와 동일한 디자인의 **완전 정적 사이트**입니다.
서버 없이 GitHub Pages 에 그대로 올릴 수 있도록:

- 콘텐츠(논문·구성원·세미나)는 DB 대신 **`data/*.json`** 에 내장
- 이미지(연구 figure·인물사진)는 **`public/uploads/`** 에 번들 (약 70MB)
- `?type=`·`?year=` 필터는 서버 렌더 대신 **클라이언트 사이드**로 동작
- 논문 PDF(약 860MB)는 용량 제한 때문에 **번들하지 않음** — 기본값에선 View 버튼이 숨겨지고,
  외부 파일 호스트를 지정하면 다시 활성화됨 (아래 참고)

## GitHub Pages 에 올리기

1. GitHub 에 새 저장소 생성 (예: `cna-lab-web`)
2. **이 폴더(gitpages/)의 내용만** 새 저장소의 루트로 push:
   ```bash
   cd gitpages
   git init -b main
   git add -A && git commit -m "initial static site"
   git remote add origin git@github.com:<계정>/cna-lab-web.git
   git push -u origin main
   ```
3. 저장소 **Settings → Pages → Source** 를 `GitHub Actions` 로 설정
4. push 할 때마다 `.github/workflows/deploy.yml` 이 자동으로 빌드·배포
   - `https://<계정>.github.io/cna-lab-web/` 형태(프로젝트 사이트)면 basePath 가 자동 적용됨
   - 저장소 이름을 `<계정>.github.io` 로 만들면 루트 도메인으로 서빙

## 콘텐츠 수정 방법

### A. JSON 직접 수정 (서버 불필요)
`data/publications.json` 등에서 항목을 추가/수정하고 commit → push 하면 재배포됩니다.
필드는 기존 DB 스키마와 동일합니다 (`is_highlight` 는 0/1).

### B. Directus 에서 수정 후 재추출 (연구실 서버에서)
```bash
# CNA_WEB 루트에서 mysql 컨테이너를 올린 뒤
docker compose up -d mysql
cd gitpages
./scripts/export-data.sh      # data/*.json 갱신
./scripts/sync-assets.sh      # 인물사진·figure 갱신 (../uploads 기준)
git commit -am "content update" && git push
```

## 논문 PDF (View 버튼)

PDF 원문 860MB 는 GitHub Pages 1GB 제한 때문에 저장소에 넣지 않았습니다. 선택지:

| 방법 | 설정 |
|---|---|
| PDF 기능 끄기 (기본) | 아무것도 안 하면 됨 — View 버튼 자체가 숨겨짐 |
| 외부 호스트에서 서빙 | 저장소 Settings → Secrets and variables → Actions → **Variables** 에 `PDF_BASE_URL` 등록 (예: `https://files.example.com`) → 해당 오리진의 `/uploads/file/...` 에서 PDF 를 https 로 서빙해야 함 |

로컬/데모 빌드에서는 `NEXT_PUBLIC_PDF_BASE_URL` 환경변수가 같은 역할을 합니다
(`"/"` = 같은 오리진, 그 외 = 외부 오리진).

## 로컬 데모 (docker)

요청자 시연용 — 정적 빌드를 nginx 로 서빙하고, PDF 는 서버의 uploads 폴더를 직접 마운트해
View 버튼까지 동작합니다:

```bash
cd gitpages
docker compose up -d --build
# → http://<서버IP>:8722
```

실제 GitHub Pages 결과물과 같은 빌드를 보려면 `docker compose build --no-cache` 후 재기동.

## 구조

```
gitpages/
├── data/*.json              ← 콘텐츠 (DB 대체)
├── public/uploads/          ← figure + 인물사진 번들 (sync-assets.sh 가 생성)
├── scripts/
│   ├── export-data.sh       ← DB → JSON 재추출
│   └── sync-assets.sh       ← 이미지 에셋 선별 복사
├── lib/
│   ├── data.ts              ← JSON 데이터 레이어 (기존 directus.ts 대체)
│   ├── asset.ts             ← basePath·PDF 호스트 헬퍼
│   └── figures.ts           ← 연구소개 figure 폴더 스캔 (빌드 시)
├── components/
│   ├── publications-browser.tsx  ← 클라이언트 필터 (기존 서버 렌더 대체)
│   └── lectures-browser.tsx
├── .github/workflows/deploy.yml  ← Pages 자동 배포
└── docker-compose.yml       ← 로컬 데모 서빙 (:8722)
```
