"use client";
import Link from "next/link";

// 화면 오른쪽에 떠다니는 퀵 내비게이션(리모컨):
// 최상단/최하단 이동 + Publications/People/Seminars 바로가기 (텍스트 버튼)
export function QuickNav() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });

  const itemClass =
    "w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-slate-100 transition hover:bg-sky-400/15 hover:text-sky-300";

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed right-4 top-1/2 z-50 hidden w-36 -translate-y-1/2 flex-col gap-0.5 rounded-2xl border border-sky-400/25 bg-slate-900/90 p-2 shadow-xl shadow-sky-500/10 ring-1 ring-black/40 backdrop-blur-md md:flex"
    >
      <button type="button" onClick={toTop} className={itemClass}>
        ↑ Top
      </button>

      <div className="my-1 h-px bg-white/10" />

      <Link href="/publications" className={itemClass}>
        Publications
      </Link>
      <Link href="/patents" className={itemClass}>
        Patents
      </Link>
      <Link href="/people" className={itemClass}>
        People
      </Link>
      <Link href="/lectures" className={itemClass}>
        Seminars
      </Link>

      <div className="my-1 h-px bg-white/10" />

      <button type="button" onClick={toBottom} className={itemClass}>
        ↓ Bottom
      </button>
    </nav>
  );
}
