"use client";
// Patents — 특허 등록원부(registry) 콘셉트: 카드 그리드 + 스탬프 배지 + 상태/연도 필터
import { useMemo, useState } from "react";
import { getPatents, type Patent } from "@/lib/data";
import { SITE } from "@/lib/labels";

type StatusFilter = "all" | Patent["status"];

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "registered", label: "등록 Registered" },
  { key: "applied", label: "출원 Filed" },
];

const STAMP: Record<Patent["status"], { label: string; className: string }> = {
  registered: { label: "등록", className: "border-emerald-500 text-emerald-600" },
  applied: { label: "출원", className: "border-amber-500 text-amber-600" },
};

const allPatents = getPatents();

export function PatentsBrowser() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [year, setYear] = useState<string>("all");

  const years = useMemo(
    () => [...new Set(allPatents.map((p) => String(p.year ?? "Others")))],
    [],
  );

  const visible = allPatents.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (year === "all" || String(p.year ?? "Others") === year),
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
          Patents filed &amp; registered by the lab
        </p>
      </header>

      {/* 필터: 상태 + 연도 */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setStatus(t.key)}
            className={
              "rounded-full px-5 py-2.5 text-sm font-semibold transition " +
              (status === t.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200")
            }
          >
            {t.label}
          </button>
        ))}
        {years.length > 1 && (
          <>
            <span className="mx-2 h-6 w-px bg-slate-200" />
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
          </>
        )}
      </div>

      {/* 증서풍 카드 그리드 */}
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <li
            key={p.id}
            className="relative flex flex-col rounded-xl border border-slate-300 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* 모서리 스탬프 */}
            <span
              className={`absolute right-5 top-5 flex h-14 w-14 rotate-12 items-center justify-center rounded-full border-2 text-sm font-black tracking-widest ${STAMP[p.status]?.className ?? "border-slate-300 text-slate-400"}`}
            >
              {STAMP[p.status]?.label ?? "—"}
            </span>

            <p className="pr-16 font-mono text-xs tracking-tight text-slate-400">
              {[p.country, p.number].filter(Boolean).join(" · ") || "—"}
            </p>
            <h3 className="mt-3 pr-10 text-lg font-bold leading-snug text-slate-900">
              {p.title}
            </h3>
            {p.inventors && (
              <p className="mt-2 text-sm text-slate-500">{p.inventors}</p>
            )}
            <div className="mt-auto flex items-center justify-between border-t border-dashed border-slate-200 pt-3 font-mono text-xs text-slate-400">
              <span>{p.year ?? ""}</span>
              {p.filing_date && <span>Filed {p.filing_date}</span>}
            </div>
          </li>
        ))}
      </ol>
      {visible.length === 0 && (
        <p className="mt-12 text-slate-400">No patents in this filter.</p>
      )}
    </div>
  );
}
