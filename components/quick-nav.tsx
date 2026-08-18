"use client";
import Link from "next/link";

// 퀵 내비게이션(리모콘)
// - 데스크톱(md+): 화면 오른쪽 중앙에 세로 배치 + 최상단/최하단 버튼
// - 모바일: 화면 하단 고정 가로 바 (섹션 링크만)
export function QuickNav() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });

  const itemClass =
    "flex-1 whitespace-nowrap rounded-xl px-2 py-2 text-center text-[11px] font-semibold text-slate-100 transition hover:bg-sky-400/15 hover:text-sky-300 " +
    "md:w-full md:flex-none md:px-4 md:text-left md:text-sm";

  return (
    <nav
      aria-label="Quick navigation"
      className={
        "fixed z-50 flex items-center gap-0.5 border border-sky-400/25 bg-slate-900/90 shadow-xl shadow-sky-500/10 ring-1 ring-black/40 backdrop-blur-md " +
        // 모바일: 하단 가로 바
        "inset-x-2 bottom-2 flex-row overflow-x-auto rounded-2xl p-1.5 " +
        // 데스크톱: 오른쪽 세로 리모콘
        "md:inset-x-auto md:bottom-auto md:right-4 md:top-1/2 md:w-36 md:-translate-y-1/2 md:flex-col md:overflow-visible md:rounded-2xl md:p-2"
      }
    >
      <button type="button" onClick={toTop} className={`hidden md:block ${itemClass}`}>
        ↑ Top
      </button>

      <div className="my-1 hidden h-px w-full bg-white/10 md:block" />

      <Link href="/" className={itemClass}>
        Introduction
      </Link>
      <Link href="/#publications" className={itemClass}>
        Publications
      </Link>
      <Link href="/#patents" className={itemClass}>
        Patents
      </Link>
      <Link href="/#people" className={itemClass}>
        People
      </Link>
      <Link href="/#seminars" className={itemClass}>
        Seminars
      </Link>

      <div className="my-1 hidden h-px w-full bg-white/10 md:block" />

      <button type="button" onClick={toBottom} className={`hidden md:block ${itemClass}`}>
        ↓ Bottom
      </button>
    </nav>
  );
}
