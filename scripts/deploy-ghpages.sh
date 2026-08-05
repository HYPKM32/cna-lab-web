#!/usr/bin/env bash
# gh-pages 브랜치 방식 배포 (repo 스코프 토큰만으로 동작 — Actions 불필요)
# 콘텐츠(data/*.json, public/uploads) 수정 후 실행하면 GitHub Pages 에 반영된다.
#
# 사용법:
#   GH_TOKEN=ghp_xxx ./scripts/deploy-ghpages.sh [owner/repo]   (기본: hanyangcna/cna-lab-web)
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="${1:-hanyangcna/cna-lab-web}"
[ -n "${GH_TOKEN:-}" ] || { echo "GH_TOKEN 환경변수에 토큰을 넣어 실행하세요" >&2; exit 1; }

BASE_PATH="/${REPO#*/}"
echo "빌드: basePath=$BASE_PATH (PDF 비활성)"
docker build -q \
  --build-arg NEXT_PUBLIC_BASE_PATH="$BASE_PATH" \
  --build-arg NEXT_PUBLIC_PDF_BASE_URL="" \
  -t cna-pages-build .

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
CID=$(docker create cna-pages-build)
docker cp -q "$CID":/usr/share/nginx/html "$WORK/out"
docker rm "$CID" >/dev/null

cd "$WORK/out"
rm -f 50x.html
touch .nojekyll
git init -qb gh-pages
git add -A
git -c user.name=deploy -c user.email=deploy@local commit -qm "deploy: $(git -C "$OLDPWD" rev-parse --short HEAD 2>/dev/null || echo manual)"
git push -f "https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git" gh-pages:gh-pages
echo "완료 → https://${REPO%%/*}.github.io${BASE_PATH}/"
