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
      {/* 등록원부풍 헤더 — 다크 밴드 + 모노 타이포 */}
      <header className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-12 text-white sm:px-12">
        {/* 배경 모눈 패턴 (도면 느낌) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <p className="relative font-mono text-xs uppercase tracking-[0.4em] text-sky-400">
          {SITE.name} · IP Registry
        </p>
        <h1 className="relative mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl">
          Patents
        </h1>
        <p className="relative mt-4 max-w-2xl text-slate-400">
          연구 성과로 출원·등록된 지식재산권 목록입니다.
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
