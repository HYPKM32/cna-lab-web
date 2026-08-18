import type { Metadata } from "next";
import { PatentsBrowser } from "@/components/patents-browser";

export const metadata: Metadata = { title: "Patents" };

// 필터는 클라이언트에서 수행 (Publications 와 동일한 패턴)
export default function PatentsPage() {
  return <PatentsBrowser />;
}
