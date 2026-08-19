// 데이터 레이어 — 콘텐츠 원본은 content/<컬렉션>/*.json (건별 파일, /admin CMS 가 편집).
// data/*.json 은 prebuild(scripts/aggregate-content.mjs)가 생성하는 집계본이다.
import publicationsJson from "@/data/publications.json";
import peopleJson from "@/data/people.json";
import lecturesJson from "@/data/lectures.json";
import patentsJson from "@/data/patents.json";
import assetsJson from "@/content/assets.json";

// --- 타입 (기존 CNA 스키마와 동일) ---
export type PubType =
  | "journal"
  | "conference"
  | "domestic_journal"
  | "domestic_conf"
  | "lecture";

export interface Publication {
  id: number;
  type: PubType;
  year: number | null;
  title: string;
  venue: string | null;
  volume: string | null;
  pages: string | null;
  authors: string | null;
  link_url: string | null;
  is_highlight: boolean;
}

export type PersonCategory =
  | "current"
  | "undergraduate"
  | "alumni_phd"
  | "alumni_ms"
  | "alumni_postdoc"
  | "alumni_visiting";

export interface Person {
  id: number;
  category: PersonCategory;
  name: string;
  role: string | null;
  email: string | null;
  affiliation: string | null;
  photo_key: string | null;
}

export interface Lecture {
  id: number;
  year: number | null;
  title: string;
  lecture_date: string | null;
  location: string | null;
  speaker: string | null;
}

export interface Patent {
  id: number;
  year: number | null;
  title: string;
  inventors: string | null;
  number: string | null; // 등록번호
  country: string | null; // 'KR' | 'US' | ...
  filing_date: string | null; // 등록/출원일 표기용 문자열
  certificate?: string | null; // 특허증 사진 (/uploads/cms/…) — CMS 업로드
}

export interface Asset {
  id: number;
  owner_type: "publication" | "lecture";
  owner_id: number;
  storage_key: string; // 'file/sub2_1/xxx.pdf'
  filename: string | null;
}

// --- 정렬 규칙은 기존 Directus 쿼리(sort=)와 동일하게 유지 ---
const publications: Publication[] = (
  publicationsJson as Array<Omit<Publication, "is_highlight"> & { is_highlight: number | boolean }>
)
  .map((p) => ({ ...p, is_highlight: Boolean(p.is_highlight) }))
  .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.id - a.id);

const people: Person[] = (
  peopleJson as Array<Person & { sort_order?: number }>
)
  .slice()
  // CMS 로 추가된 항목은 sort_order 가 없을 수 있음 → 그룹 맨 뒤
  .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999) || a.id - b.id);

const lectures: Lecture[] = (lecturesJson as Lecture[])
  .slice()
  .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.id - a.id);

const patents: Patent[] = (patentsJson as Patent[])
  .slice()
  .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.id - a.id);

const assets: Asset[] = (assetsJson as Asset[]).slice().sort((a, b) => a.id - b.id);

// --- 도메인 헬퍼 (기존 시그니처 유지 — await 해도 무방) ---
export function getPublications(type?: PubType | "highlight") {
  if (type === "highlight") return publications.filter((p) => p.is_highlight);
  if (type) return publications.filter((p) => p.type === type);
  return publications;
}

export function getPeople() {
  return people;
}

export function getLectures() {
  return lectures;
}

export function getPatents() {
  return patents;
}

export function getAssetsByOwner(ownerType: Asset["owner_type"]) {
  const map = new Map<number, Asset[]>();
  for (const a of assets) {
    if (a.owner_type !== ownerType) continue;
    (map.get(a.owner_id) ?? map.set(a.owner_id, []).get(a.owner_id)!).push(a);
  }
  return map;
}

export function getStats() {
  // 현재 인원(재학·학부 포함)과 졸업생(alumni_*)을 구분해 카운트
  const current = people.filter(
    (p) => p.category === "current" || p.category === "undergraduate",
  ).length;
  return {
    publications: publications.length,
    patents: patents.length,
    currentMembers: current,
    alumni: people.length - current,
    lectures: lectures.length,
  };
}
