import type { PubType, PersonCategory } from "./data";

export const SITE = {
  name: "CNA Lab",
  full: "Computational Neuroimaging & Analysis Lab",
  org: "Department of Biomedical Engineering & Department of Artificial Intelligence, Hanyang University",
  pi: "Prof. Jong-Min Lee",
};

// 원페이지 구조: 탭은 홈의 해당 섹션으로 스크롤 이동
export const NAV = [
  { href: "/", label: "Introduction" },
  { href: "/#publications", label: "Publications" },
  { href: "/#patents", label: "Patents" },
  { href: "/#people", label: "People" },
  { href: "/#seminars", label: "Seminars" },
];

export const PUB_TYPE_LABEL: Record<PubType, string> = {
  journal: "International Journal",
  conference: "Conference",
  domestic_journal: "Domestic Journal",
  domestic_conf: "Domestic Conference",
  lecture: "Lecture",
};

// Publications 필터 탭 (순서 지정)
export const PUB_FILTERS: { key: PubType | "highlight" | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "highlight", label: "Highlights" },
  { key: "journal", label: "International Journal" },
  { key: "conference", label: "Conference" },
  { key: "domestic_journal", label: "Domestic Journal" },
  { key: "domestic_conf", label: "Domestic Conference" },
];

// People 카테고리 표시 순서 + 라벨
export const PEOPLE_GROUPS: { key: PersonCategory; label: string }[] = [
  { key: "current", label: "Current Members" },
  { key: "undergraduate", label: "Undergraduate" },
  { key: "alumni_postdoc", label: "Alumni · Post Doc." },
  { key: "alumni_phd", label: "Alumni · Ph.D." },
  { key: "alumni_ms", label: "Alumni · M.S." },
  { key: "alumni_visiting", label: "Alumni · Visiting" },
];
