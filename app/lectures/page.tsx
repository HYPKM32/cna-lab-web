import type { Metadata } from "next";
import { LecturesBrowser } from "@/components/lectures-browser";

export const metadata: Metadata = { title: "Seminars" };

// 정적 export: 데이터는 빌드 시 JSON 에서 번들되고, 연도 필터는 클라이언트에서 수행
export default function LecturesPage() {
  return <LecturesBrowser />;
}
