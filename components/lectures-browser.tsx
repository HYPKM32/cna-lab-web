"use client";
// 정적 사이트용 Seminars 목록 — 연도 필터를 클라이언트 상태로 처리
import { useState } from "react";
import { getLectures, getAssetsByOwner, type Lecture } from "@/lib/data";
import { PdfViewerProvider, PdfViewButton } from "@/components/pdf-viewer";
import { PDF_ENABLED, pdfUrl } from "@/lib/asset";
import { SITE } from "@/lib/labels";

function groupByYear(lectures: Lecture[]) {
  const map = new Map<string, Lecture[]>();
  for (const l of lectures) {
    const key = l.year ? String(l.year) : "Others";
    (map.get(key) ?? map.set(key, []).get(key)!).push(l);
  }
  return [...map.entries()].sort((a, b) => {
    if (a[0] === "Others") return 1;
    if (b[0] === "Others") return -1;
    return Number(b[0]) - Number(a[0]);
  });
}

const grouped = groupByYear(getLectures());
const years = grouped.map(([y]) => y);
const assetMap = getAssetsByOwner("lecture");

export function LecturesBrowser() {
  // 기본은 최신 연도만 — 스크롤 최소화 (Publications 와 동일한 규칙)
  const [year, setYear] = useState<string>(years[0] ?? "all");
  const visible =
    year === "all" ? grouped : grouped.filter(([y]) => y === year);

  return (
    <PdfViewerProvider>
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* 학술지 표지 느낌의 헤더 (Publications/People 과 통일) */}
      <header className="border-b-4 border-double border-slate-900 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
          {SITE.name} · Invited Talks
        </p>
        <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Seminars
        </h1>
        <p className="mt-4 font-serif text-lg italic text-slate-500">
          Guest lectures &amp; research seminars hosted by the lab
        </p>
      </header>

      {/* Year tabs */}
      {years.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-1.5">
          {["all", ...years].map((y) => {
            const isActive = y === year;
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

      {/* 연도별 타임라인 */}
      <div className="mt-12 space-y-14">
        {visible.map(([y, list]) => (
          <section key={y}>
            <h2 className="font-serif text-3xl font-bold text-slate-900">{y}</h2>
            <ol className="mt-7 space-y-10 border-l-2 border-slate-200 pl-10">
              {list.map((l) => (
                <li key={l.id} className="relative">
                  {/* 타임라인 점 */}
                  <span className="absolute -left-[49px] top-1.5 h-4 w-4 rounded-full border-[3px] border-sky-500 bg-white" />
                  {l.lecture_date && (
                    <p className="text-base font-semibold text-sky-700">
                      {l.lecture_date}
                    </p>
                  )}
                  <h3 className="mt-1.5 text-2xl font-bold leading-snug text-slate-900">
                    {l.title}
                  </h3>
                  {l.speaker && (
                    <p className="mt-2 text-base text-slate-600">{l.speaker}</p>
                  )}
                  {l.location && (
                    <p className="mt-1 text-base text-slate-400">
                      {l.location}
                    </p>
                  )}
                  {/* 첨부 PDF → 사이드 뷰어로 보기 (PDF 호스트 설정 시에만) */}
                  {PDF_ENABLED &&
                    (assetMap.get(l.id) ?? []).some((a) =>
                      /\.pdf$/i.test(a.storage_key),
                    ) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(assetMap.get(l.id) ?? [])
                          .filter((a) => /\.pdf$/i.test(a.storage_key))
                          .map((a) => (
                            <PdfViewButton
                              key={a.id}
                              src={pdfUrl(a.storage_key)}
                              title={a.filename ?? l.title}
                            />
                          ))}
                      </div>
                    )}
                </li>
              ))}
            </ol>
          </section>
        ))}
        {visible.length === 0 && (
          <p className="text-slate-400">No seminars yet.</p>
        )}
      </div>
    </div>
    </PdfViewerProvider>
  );
}
