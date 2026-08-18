"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// 퀵 내비게이션(리모콘)
// - 데스크톱(md+): 화면 오른쪽 중앙에 세로 배치 + 최상단/최하단 버튼
// - 모바일: 화면 하단 고정 가로 바 (섹션 링크만)
// - 스크롤 위치에 따라 현재 보고 있는 섹션을 하이라이트
const ITEMS = [
  { id: "intro", href: "/", label: "Introduction" },
  { id: "publications", href: "/#publications", label: "Publications" },
  { id: "patents", href: "/#patents", label: "Patents" },
  { id: "people", href: "/#people", label: "People" },
  { id: "seminars", href: "/#seminars", label: "Seminars" },
];

export function QuickNav() {
  const [current, setCurrent] = useState("intro");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      // 화면 위쪽 1/3 지점을 기준으로 현재 섹션 판정
      const probe = window.scrollY + window.innerHeight / 3;
      let cur = "intro";
      for (const { id } of ITEMS.slice(1)) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top + window.scrollY <= probe) cur = id;
      }
      setCurrent(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });

  const itemClass = (active: boolean) =>
    "flex-1 whitespace-nowrap rounded-xl px-2 py-2 text-center text-[11px] font-semibold transition " +
    "md:w-full md:flex-none md:px-4 md:text-left md:text-sm " +
    (active
      ? "bg-sky-400/20 text-sky-300"
      : "text-slate-100 hover:bg-sky-400/15 hover:text-sky-300");

  return (
    <nav
      aria-label="Quick navigation"
      className={
        "fixed z-50 flex items-center gap-0.5 border border-sky-400/25 bg-slate-900/90 shadow-xl shadow-sky-500/10 ring-1 ring-black/40 backdrop-blur-md " +
        // 모바일: 화면에 딱 붙는 전폭 하단 바 (+ 아이폰 안전영역 패딩)
        "inset-x-0 bottom-0 flex-row overflow-x-auto rounded-none border-x-0 border-b-0 border-t p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] " +
        // 데스크톱: 오른쪽 세로 리모콘
        "md:inset-x-auto md:bottom-auto md:right-4 md:top-1/2 md:w-36 md:-translate-y-1/2 md:flex-col md:overflow-visible md:rounded-2xl md:border md:p-2"
      }
    >
      <button type="button" onClick={toTop} className={`hidden md:block ${itemClass(false)}`}>
        ↑ Top
      </button>

      <div className="my-1 hidden h-px w-full bg-white/10 md:block" />

      {ITEMS.map((it) => (
        <Link key={it.id} href={it.href} className={itemClass(current === it.id)}>
          {it.label}
        </Link>
      ))}

      <div className="my-1 hidden h-px w-full bg-white/10 md:block" />

      <button type="button" onClick={toBottom} className={`hidden md:block ${itemClass(false)}`}>
        ↓ Bottom
      </button>
    </nav>
  );
}
