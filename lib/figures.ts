// 연구소개 figure 폴더 읽기 (public/uploads/figure/<섹션>/<순번>_<제목>.png)
// 정적 export 라 빌드 시점에 읽힌다 — 파일 추가/삭제 후 재배포하면 반영.
import { readdir } from "node:fs/promises";
import path from "node:path";
import { asset } from "./asset";

const FIGURE_DIR =
  process.env.FIGURE_DIR ?? path.join(process.cwd(), "public/uploads/figure");
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

// 홈에 노출할 섹션과 순서 (폴더명 ↔ 표시 제목)
const SECTIONS = [
  { folder: "Brain_Disorder_and_Samd", title: "Brain Disorder and SaMD" },
  { folder: "NeuroImages", title: "NeuroImages" },
  {
    folder: "The_Integration_of_Neuroimaging_and_AI",
    title: "The Integration of Neuroimaging and AI",
  },
];

export interface Figure {
  src: string; // /uploads/figure/... (nginx 가 서빙)
  label: string; // 파일명에서 순번·확장자 뗀 제목
}

export interface ResearchSection {
  title: string;
  figures: Figure[];
}

export async function getResearchSections(): Promise<ResearchSection[]> {
  return Promise.all(
    SECTIONS.map(async ({ folder, title }) => {
      let files: string[] = [];
      try {
        files = await readdir(path.join(FIGURE_DIR, folder));
      } catch {
        // 폴더가 없으면 빈 섹션으로
      }
      const figures = files
        .filter((f) => IMAGE_EXT.test(f))
        .map((f) => {
          const m = f.match(/^(\d+)[_-]*(.*)\.[^.]+$/);
          return {
            order: m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER,
            src: asset(`/uploads/figure/${folder}/${f}`),
            label: (m?.[2] || f.replace(IMAGE_EXT, "")).replace(/_/g, " ").trim(),
          };
        })
        .sort((a, b) => a.order - b.order)
        .map(({ src, label }) => ({ src, label }));
      return { title, figures };
    }),
  );
}
