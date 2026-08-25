// 연구소개 figure — 콘텐츠 원본은 content/research/*.json (건별 파일, /admin CMS 가 편집).
// data/research.json 은 prebuild(scripts/aggregate-content.mjs)가 생성하는 집계본이다.
import researchJson from "@/data/research.json";
import { asset } from "./asset";
import { RESEARCH_SECTIONS as SECTIONS } from "./research-meta";

interface ResearchRow {
  id: number;
  section: string; // RESEARCH_SECTIONS 의 folder 키
  order: number | null; // 섹션 내 표시 순서 (작을수록 앞)
  title: string;
  image: string; // /uploads/... 경로 (CMS image 위젯)
}

export interface Figure {
  src: string; // basePath 프리픽스 포함 이미지 경로
  label: string; // 캡션 바 제목
}

export interface ResearchSection {
  title: string;
  figures: Figure[];
}

export async function getResearchSections(): Promise<ResearchSection[]> {
  const rows = researchJson as ResearchRow[];
  return SECTIONS.map(({ folder, title }) => ({
    title,
    figures: rows
      .filter((r) => r.section === folder && r.image)
      .sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
            (b.order ?? Number.MAX_SAFE_INTEGER) || a.id - b.id,
      )
      .map((r) => ({ src: asset(r.image), label: r.title })),
  }));
}
