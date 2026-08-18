import Link from "next/link";
import { NAV, SITE } from "@/lib/labels";
import { asset } from "@/lib/asset";

export function SiteHeader() {
  return (
    <header className="border-b border-black/5 bg-white">
      {/* 모바일: 로고만 (탭은 하단 퀵바가 대신) / 데스크톱: 로고 + 탭 한 줄 */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/cna-logo.png")}
            alt={SITE.name}
            className="h-12 w-auto rounded-xl md:h-16"
          />
          <span className="h-8 w-px bg-slate-200 md:h-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/hyu-logo.png")} alt="Hanyang University" className="h-8 w-auto md:h-11" />
          {/* 소속 학과 — 로고 옆 두 줄 */}
          {/* 학과명 — 네비와 안 겹치는 넓은 화면(xl+)에서만, 항상 한 줄 유지 */}
          <span className="hidden flex-col justify-center text-[11px] font-medium leading-tight text-slate-500 xl:flex">
            {SITE.org
              .split(/ & |, /)
              .filter((line) => !/hanyang/i.test(line))
              .map((line) => (
                // 학과명은 중간에서 줄바꿈되지 않게 한 줄 유지
                <span key={line} className="whitespace-nowrap">
                  {line}
                </span>
              ))}
          </span>
        </Link>
        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-base font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 xl:px-5 xl:py-2.5 xl:text-lg"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
        <p className="font-semibold text-slate-700">{SITE.full}</p>
        <p>{SITE.org}</p>
        <p className="mt-2 text-xs text-slate-400">
          © {new Date().getFullYear()} {SITE.name}. {SITE.pi}.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Site designed &amp; developed by{" "}
          <span className="font-medium text-slate-500">Keun-mo Park</span>.
        </p>
      </div>
    </footer>
  );
}
