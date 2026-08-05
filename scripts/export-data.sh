#!/usr/bin/env bash
# 운영 DB(cna_mysql 컨테이너) → data/*.json 재추출
# Directus 에서 콘텐츠를 수정한 뒤 정적 사이트에 반영하고 싶을 때 실행:
#   1) CNA_WEB 에서: docker compose up -d mysql
#   2) ./scripts/export-data.sh
#   3) 인물사진이 바뀌었으면 ./scripts/sync-assets.sh 도 실행
#   4) git commit & push → GitHub Actions 가 자동 재배포
set -euo pipefail
cd "$(dirname "$0")/.."

dump() {
  docker exec cna_mysql sh -c \
    "mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" CNA --batch --raw -N -e \"$1\"" 2>/dev/null
}

dump "SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'type',type,'year',year,'title',title,'venue',venue,'volume',volume,'pages',pages,'authors',authors,'link_url',link_url,'is_highlight',is_highlight)) FROM publications" > data/publications.json
# phone 은 화면에 안 쓰이고 공개 저장소에 노출되면 안 되므로 제외
dump "SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'category',category,'name',name,'role',role,'email',email,'affiliation',affiliation,'photo_key',photo_key,'sort_order',sort_order)) FROM people" > data/people.json
dump "SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'year',year,'title',title,'lecture_date',lecture_date,'location',location,'speaker',speaker)) FROM lectures" > data/lectures.json
dump "SELECT JSON_ARRAYAGG(JSON_OBJECT('id',id,'owner_type',owner_type,'owner_id',owner_id,'storage_key',storage_key,'filename',filename)) FROM assets WHERE owner_type IN ('publication','lecture')" > data/assets.json

# 보기 좋게 + JSON 유효성 검증
for f in data/*.json; do
  python3 -c "
import json
d = json.load(open('$f'))
json.dump(d, open('$f', 'w'), ensure_ascii=False, indent=1)
print('$f', len(d), 'rows')
"
done
