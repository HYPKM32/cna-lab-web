#!/usr/bin/env bash
# 사이트에 필요한 업로드 에셋만 public/uploads 로 복사한다 (재실행 안전).
#   - 연구소개 figure 전체 (uploads/figure)
#   - 구성원 사진 (data/people.json 의 photo_key 파일만)
# 논문/세미나 PDF(수백 MB)는 GitHub Pages 용량 제한 때문에 번들하지 않음.
#
# 사용법: ./scripts/sync-assets.sh [원본 uploads 경로]   (기본: ../uploads)
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-../uploads}"
DST="public/uploads"

[ -d "$SRC" ] || { echo "원본 uploads 폴더가 없습니다: $SRC" >&2; exit 1; }

# 1) figure 전체
mkdir -p "$DST"
rsync -a --delete "$SRC/figure/" "$DST/figure/"
echo "figure: $(find "$DST/figure" -type f | wc -l)개 파일"

# 2) 구성원 사진 (photo_key 만 선별 복사)
copied=0; missing=0
while IFS= read -r key; do
  [ -n "$key" ] || continue
  if [ -f "$SRC/$key" ]; then
    mkdir -p "$DST/$(dirname "$key")"
    cp -p "$SRC/$key" "$DST/$key"
    copied=$((copied + 1))
  else
    echo "  누락: $key" >&2
    missing=$((missing + 1))
  fi
done < <(python3 -c "
import json
for p in json.load(open('data/people.json')):
    if p.get('photo_key'):
        print(p['photo_key'])
")
echo "인물사진: ${copied}개 복사, ${missing}개 누락"
du -sh "$DST"
