"use client";
// Patents — 등록 특허 카드 그리드 + 연도 필터
import { useMemo, useState } from "react";
import { getPatents } from "@/lib/data";
import { asset } from "@/lib/asset";
import { SITE } from "@/lib/labels";

const allPatents = getPatents();

export function PatentsBrowser() {
  const [year, setYear] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");

  const years = useMemo(
    () => [...new Set(allPatents.map((p) => String(p.year ?? "Others")))],
    [],
  );
  const countries = useMemo(
    () => [...new Set(allPatents.map((p) => p.country ?? "KR"))].sort(),
    [],
  );

  const visible = allPatents.filter(
    (p) =>
      (year === "all" || String(p.year ?? "Others") === year) &&
      (country === "all" || (p.country ?? "KR") === country),
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

      {/* 필터 패널 — 연도 + 국가 (Publications 패널과 톤 통일) */}
      {allPatents.length > 0 && (
        <div className="mt-8 space-y-1.5 rounded-2xl border border-sky-300 bg-white/95 p-1.5 sm:space-y-2.5 sm:p-2.5">
          {/* 국가 줄 (분류 성격 — Publications 의 종류 줄과 같은 위치/톤) */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-visible">
            {["all", ...countries].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCountry(c)}
                className={
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm " +
                  (country === c
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                }
              >
                {c === "all" ? "All countries" : c}
              </button>
            ))}
          </div>
          {/* 연도 줄 */}
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto border-t border-slate-100 pt-1.5 sm:flex-wrap sm:overflow-visible sm:pt-2.5">
            {["all", ...years].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={
                  "whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition sm:px-3.5 sm:py-1.5 sm:text-sm " +
                  (year === y
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-sky-50 hover:text-sky-700")
                }
              >
                {y === "all" ? "All years" : y}
              </button>
            ))}
          </div>
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
