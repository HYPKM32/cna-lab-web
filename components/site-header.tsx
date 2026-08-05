import Link from "next/link";
import { NAV, SITE } from "@/lib/labels";
import { asset } from "@/lib/asset";

export function SiteHeader() {
  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/cna-logo.png")}
            alt={SITE.name}
            className="h-16 w-auto rounded-xl"
          />
          <span className="h-10 w-px bg-slate-200" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/hyu-logo.png")} alt="Hanyang University" className="h-11 w-auto" />
          {/* 소속 학과 — 로고 옆 두 줄 */}
          <span className="hidden flex-col justify-center text-[11px] font-medium leading-tight text-slate-500 sm:flex">
            {SITE.org
              .split(/ & |, /)
              .filter((line) => !/hanyang/i.test(line))
              .map((line) => (
                <span key={line}>{line}</span>
              ))}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-5 py-2.5 text-lg font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
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
