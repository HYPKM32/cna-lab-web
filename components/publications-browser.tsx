"use client";
// 정적 사이트용 Publications 목록 — 서버 쿼리 파라미터 대신
// 클라이언트 상태로 type/year 필터링 (?type= 딥링크는 초기값으로만 반영)
import { useMemo, useState } from "react";
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
    const key = p.year ? String(p.year) : "Others";
    (map.get(key) ?? map.set(key, []).get(key)!).push(p);
  }
  // 연도 내림차순, "Others"는 맨 뒤
  return [...map.entries()].sort((a, b) => {
    if (a[0] === "Others") return 1;
    if (b[0] === "Others") return -1;
    return Number(b[0]) - Number(a[0]);
  });
}

const assetMap = getAssetsByOwner("publication");

export function PublicationsBrowser() {
  const params = useSearchParams();
  const initial = (PUB_FILTERS.find((f) => f.key === params.get("type"))?.key ??
    "all") as FilterKey;
  const [active, setActive] = useState<FilterKey>(initial);
  // undefined = 기본(최신 연도)
  const [year, setYear] = useState<string | undefined>(undefined);

  const pubs = useMemo(
    () => getPublications(active === "all" ? undefined : active),
    [active],
  );
  const grouped = useMemo(() => groupByYear(pubs), [pubs]);
  const years = grouped.map(([y]) => y);
  const latest = years[0];

  // 하이라이트는 항상 최신 연도만. 그 외엔 연도 선택(기본: 최신 연도)
  const selected =
    active === "highlight"
      ? latest
      : year === "all" || (year && years.includes(year))
        ? year
        : latest;
  const visible =
    selected === "all" ? grouped : grouped.filter(([y]) => y === selected);

  const pickType = (key: FilterKey) => {
    setActive(key);
    setYear(undefined);
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

      {/* Filter tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        {PUB_FILTERS.map((f) => {
          const isActive = f.key === active;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => pickType(f.key as FilterKey)}
              className={
                "rounded-full px-5 py-2.5 text-base font-medium transition " +
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

      {/* Year tabs (하이라이트는 최신 연도 고정이라 숨김) */}
      {active !== "highlight" && years.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["all", ...years].map((y) => {
            const isActive = y === selected;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={
                  "rounded-full px-4 py-2 text-sm font-semibold transition " +
                  (isActive
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-sky-50 hover:text-sky-700")
                }
              >
                {y === "all" ? "All years" : y}
              </button>
            );
          })}
        </div>
      )}

      {/* Grouped list */}
      <div className="mt-12 space-y-12">
        {visible.map(([year, list]) => (
          <section key={year}>
            <h2 className="sticky top-0 z-10 -mx-2 bg-white/90 px-2 py-2 font-serif text-3xl font-bold text-slate-900 backdrop-blur">
              {year}
            </h2>
            <ol className="mt-5 space-y-4">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-sky-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
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
