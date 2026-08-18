"use client";
// 정적 사이트용 Publications 목록 — 서버 쿼리 파라미터 대신
// 클라이언트 상태로 type/year 필터링 (?type= 딥링크는 초기값으로만 반영)
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getPublications,
  getAssetsByOwner,
  type Publication,
  type PubType,
} from "@/lib/data";
import { PdfViewerProvider, PdfViewButton } from "@/components/pdf-viewer";
import { PDF_ENABLED, pdfUrl } from "@/lib/asset";
import { PUB_FILTERS, PUB_TYPE_LABEL, SITE } from "@/lib/labels";

type FilterKey = PubType | "highlight" | "all";

function groupByYear(pubs: Publication[]) {
  const map = new Map<string, Publication[]>();
  for (const p of pubs) {
    const key = p.year ? String(p.year) : "In-progress";
    (map.get(key) ?? map.set(key, []).get(key)!).push(p);
  }
  // 연도 내림차순, "In-progress"(연도 미정)는 맨 뒤
  return [...map.entries()].sort((a, b) => {
    if (a[0] === "In-progress") return 1;
    if (b[0] === "In-progress") return -1;
    return Number(b[0]) - Number(a[0]);
  });
}

const assetMap = getAssetsByOwner("publication");

export function PublicationsBrowser() {
  const params = useSearchParams();
  const initial = (PUB_FILTERS.find((f) => f.key === params.get("type"))?.key ??
    "all") as FilterKey;
  const [active, setActive] = useState<FilterKey>(initial);
  const [activeYear, setActiveYear] = useState<string | null>(null);

  // 홈 "See all →" 처럼 같은 페이지에서 ?type= 이 바뀌면 필터를 전환
  const typeParam = params.get("type");
  useEffect(() => {
    const key = PUB_FILTERS.find((f) => f.key === typeParam)?.key;
    if (key) {
      setActive(key as FilterKey);
      setActiveYear(null);
    }
  }, [typeParam]);

  // 전체 연도를 한 번에 렌더링 — 연도 탭은 필터가 아니라 해당 위치로 점프하는 앵커
  const pubs = useMemo(
    () => getPublications(active === "all" ? undefined : active),
    [active],
  );
  const grouped = useMemo(() => groupByYear(pubs), [pubs]);
  const years = grouped.map(([y]) => y);

  const pickType = (key: FilterKey) => {
    setActive(key);
    setActiveYear(null);
    // 원페이지에선 맨 위(히어로)가 아니라 Publications 섹션 시작으로
    const anchor = document.getElementById("publications");
    if (anchor) anchor.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0 });
  };

  const jumpTo = (y: string) => {
    setActiveYear(y);
    document
      .getElementById(`pub-year-${y}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PdfViewerProvider>
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* 학술지 표지(masthead) 느낌의 헤더 — 세리프 + 이중 괘선 */}
      <header className="border-b-4 border-double border-slate-900 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
          {SITE.name} · Academic Records
        </p>
        <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Publications
        </h1>
        <p className="mt-4 font-serif text-lg italic text-slate-500">
          Peer-reviewed journals, conference proceedings &amp; lectures
        </p>
      </header>

      {/* 필터 패널 — 종류 + 연도 점프를 한 덩어리로 상단 고정 */}
      <div className="sticky top-2 z-20 mt-8 space-y-2.5 rounded-2xl border border-sky-300 bg-white/95 p-2.5 backdrop-blur">
        <div className="flex flex-wrap gap-1.5">
          {PUB_FILTERS.map((f) => {
            const isActive = f.key === active;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => pickType(f.key as FilterKey)}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium transition sm:px-5 sm:text-base " +
                  (isActive
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
        {years.length > 1 && (
          <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => jumpTo(y)}
                className={
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition " +
                  (activeYear === y
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-sky-50 hover:text-sky-700")
                }
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grouped list — 전체 연도 렌더링 */}
      <div className="mt-8 space-y-12">
        {grouped.map(([year, list]) => (
          <section key={year} id={`pub-year-${year}`} className="scroll-mt-52 sm:scroll-mt-44">
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              {year}
            </h2>
            <ol className="mt-5 space-y-4">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-sky-300 hover:shadow-sm"
                >
                  {/* 모바일: 세로 쌓기 / 데스크톱: 좌우 배치 */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-500">
                          {PUB_TYPE_LABEL[p.type]}
                        </span>
                        {p.is_highlight && (
                          <span className="rounded-md bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-700">
                            ★ Highlight
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-900">
                        {p.title}
                      </h3>
                      {p.authors && (
                        <p className="mt-2 text-base text-slate-500">
                          {p.authors}
                        </p>
                      )}
                      <p className="mt-1.5 text-base italic text-slate-400">
                        {[p.venue, p.volume, p.pages].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    {/* 우측 액션: PDF 뷰어 + 원문 링크 */}
                    <div className="flex shrink-0 items-center gap-2">
                      {PDF_ENABLED &&
                        (assetMap.get(p.id) ?? [])
                          .filter((a) => /\.pdf$/i.test(a.storage_key))
                          .map((a) => (
                            <PdfViewButton
                              key={a.id}
                              src={pdfUrl(a.storage_key)}
                              title={a.filename ?? p.title}
                            />
                          ))}
                      {p.link_url && (
                        <a
                          href={p.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                        >
                          Link ↗
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
        {grouped.length === 0 && (
          <p className="text-slate-400">No publications in this category.</p>
        )}
      </div>
    </div>
    </PdfViewerProvider>
  );
}
