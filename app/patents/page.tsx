import type { Metadata } from "next";
import { getPatents, type Patent } from "@/lib/data";
import { SITE } from "@/lib/labels";

export const metadata: Metadata = { title: "Patents" };

const STATUS: Record<Patent["status"], { label: string; className: string }> = {
  registered: { label: "등록 Registered", className: "bg-emerald-100 text-emerald-700" },
  applied: { label: "출원 Filed", className: "bg-amber-100 text-amber-700" },
};

function groupByYear(patents: Patent[]) {
  const map = new Map<string, Patent[]>();
  for (const p of patents) {
    const key = p.year ? String(p.year) : "Others";
    (map.get(key) ?? map.set(key, []).get(key)!).push(p);
  }
  return [...map.entries()].sort((a, b) => {
    if (a[0] === "Others") return 1;
    if (b[0] === "Others") return -1;
    return Number(b[0]) - Number(a[0]);
  });
}

export default function PatentsPage() {
  const grouped = groupByYear(getPatents());

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* 학술지 표지 느낌의 헤더 (다른 서브페이지와 통일) */}
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

      {/* 연도별 목록 */}
      <div className="mt-12 space-y-12">
        {grouped.map(([year, list]) => (
          <section key={year}>
            <h2 className="font-serif text-3xl font-bold text-slate-900">{year}</h2>
            <ol className="mt-5 space-y-4">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-sky-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-1 text-sm font-semibold ${STATUS[p.status]?.className ?? "bg-slate-100 text-slate-500"}`}
                    >
                      {STATUS[p.status]?.label ?? p.status}
                    </span>
                    {p.country && (
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-500">
                        {p.country}
                      </span>
                    )}
                    {p.filing_date && (
                      <span className="text-sm text-slate-400">{p.filing_date}</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold leading-snug text-slate-900">
                    {p.title}
                  </h3>
                  {p.inventors && (
                    <p className="mt-2 text-base text-slate-500">{p.inventors}</p>
                  )}
                  {p.number && (
                    <p className="mt-1.5 font-mono text-sm tracking-tight text-slate-400">
                      {p.number}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
        {grouped.length === 0 && (
          <p className="text-slate-400">No patents yet.</p>
        )}
      </div>
    </div>
  );
}
