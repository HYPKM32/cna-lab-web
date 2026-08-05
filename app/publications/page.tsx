import { Suspense } from "react";
import type { Metadata } from "next";
import { PublicationsBrowser } from "@/components/publications-browser";

export const metadata: Metadata = { title: "Publications" };

// 정적 export: 데이터는 빌드 시 JSON 에서 번들되고, 필터링은 클라이언트에서 수행
export default function PublicationsPage() {
  return (
    // useSearchParams(?type= 딥링크) 때문에 Suspense 경계 필요
    <Suspense>
      <PublicationsBrowser />
    </Suspense>
  );
}
