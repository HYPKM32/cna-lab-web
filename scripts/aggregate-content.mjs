// content/<컬렉션>/*.json (건별, CMS 가 편집) → data/<컬렉션>.json (배열, 번들용) 생성
// npm run build 의 prebuild 훅으로 자동 실행된다. data/ 는 git 미추적(생성물).
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const COLLECTIONS = ["publications", "people", "lectures"];

await mkdir(path.join(ROOT, "data"), { recursive: true });

for (const name of COLLECTIONS) {
  const dir = path.join(ROOT, "content", name);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  const rows = [];
  for (const f of files) {
    try {
      rows.push(JSON.parse(await readFile(path.join(dir, f), "utf8")));
    } catch (e) {
      throw new Error(`content/${name}/${f} JSON 파싱 실패: ${e.message}`);
    }
  }
  // CMS 로 새로 만든 항목은 id 가 없다 → 기존 최대 id 이후 번호를 파일명순으로 부여
  // (React key 유일성 + "같은 연도 안에서 최신 등록이 위" 정렬을 위해)
  let nextId = Math.max(0, ...rows.map((r) => r.id ?? 0)) + 1;
  for (const r of rows) if (r.id == null) r.id = nextId++;
  await writeFile(
    path.join(ROOT, "data", `${name}.json`),
    JSON.stringify(rows),
  );
  console.log(`data/${name}.json ← content/${name}/ (${rows.length}건)`);
}
