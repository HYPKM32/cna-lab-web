"use client";
// Patents — 등록 특허 카드 그리드 + 연도 필터
import { useMemo, useState } from "react";
import { getPatents } from "@/lib/data";
import { asset } from "@/lib/asset";
import { SITE } from "@/lib/labels";

const allPatents = getPatents();

export function PatentsBrowser() {
  const [year, setYear] = useState<string>("all");

  const years = useMemo(
    () => [...new Set(allPatents.map((p) => String(p.year ?? "Others")))],
    [],
  );

  const visible = allPatents.filter(
    (p) => year === "all" || String(p.year ?? "Others") === year,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* 헤더 — 다른 서브페이지(Publications/People/Seminars)와 통일 */}
      <header className="border-b-4 border-double border-slate-900 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
          {SITE.name} · Intellectual Property
        </p>
        <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Patents
        </h1>
        <p className="mt-4 font-serif text-lg italic text-slate-500">
          Registered patents from our research
        </p>
      </header>

      {/* 연도 필터 — 은은한 하이라이트 패널 */}
      {years.length > 1 && (
        <div className="mt-8 inline-flex flex-wrap gap-1.5 rounded-2xl border border-sky-300 bg-white p-2">
          {["all", ...years].map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={
                "rounded-full px-4 py-2 text-sm font-semibold transition " +
                (year === y
                  ? "bg-sky-600 text-white"
                  : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-sky-50 hover:text-sky-700")
              }
            >
              {y === "all" ? "All years" : y}
            </button>
          ))}
        </div>
      )}

      {/* 특허 공보(서지)풍 카드 그리드 — 상단 메타 밴드 + 하단 등록정보 표 */}
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <li
            key={p.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md"
          >
            {/* 상단 메타 밴드: 국가 코드 + 등록번호 */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
              <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-widest text-white">
                {p.country ?? "KR"}
              </span>
              <span className="truncate font-mono text-xs tracking-tight text-slate-500">
                {p.number ?? "—"}
              </span>
            </div>

            {/* 본문: 발명의 명칭 + 발명자 */}
            <div className="flex flex-1 flex-col px-6 py-5">
              <h3 className="text-lg font-bold leading-snug text-slate-900 transition group-hover:text-sky-800">
                {p.title}
              </h3>
              {p.inventors && (
                <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
                  {p.inventors}
                </p>
              )}
            </div>

            {/* 하단 등록정보 — 2열 정의 목록 */}
            <dl className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 text-xs">
              <div className="px-6 py-3">
                <dt className="font-medium uppercase tracking-wider text-slate-400">
                  Year
                </dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-slate-700">
                  {p.year ?? "—"}
                </dd>
              </div>
              <div className="px-6 py-3">
                <dt className="font-medium uppercase tracking-wider text-slate-400">
                  Registered
                </dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-slate-700">
                  {p.filing_date ?? "—"}
                </dd>
              </div>
            </dl>

            {/* 특허증 사진 — 있을 때만 원본 보기 버튼 */}
            {p.certificate && (
              <a
                href={asset(p.certificate)}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-t border-slate-100 bg-slate-50/60 px-6 py-2.5 text-center text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                View Certificate ↗
              </a>
            )}
          </li>
        ))}
      </ol>
      {visible.length === 0 && (
        <p className="mt-12 text-slate-400">No patents yet.</p>
      )}
    </div>
  );
}
