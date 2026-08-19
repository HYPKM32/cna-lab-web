"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RESEARCH_SECTIONS } from "@/lib/research-meta";

// 퀵 내비게이션(리모콘)
// - 데스크톱(md+): 화면 오른쪽 중앙 세로 리모콘 + 최상단/최하단 버튼
// - 모바일: 화면 하단 고정 가로 바
// - 스크롤 위치에 따라 현재 섹션 하이라이트
// - 세부 리모콘: 현재 섹션에 children 이 있으면 "별도 패널"로 등장
//   (데스크톱: 메인 리모콘 왼쪽 / 모바일: 하단 바 위에 떠 있는 바)
const INTRO_CHILDREN = RESEARCH_SECTIONS.map((s, i) => ({
  id: `research-${i + 1}`,
  label: `${String(i + 1).padStart(2, "0")} ${s.short}`,
}));

const ITEMS: {
  id: string;
  href: string;
  label: string;
  children?: { id: string; label: string }[];
}[] = [
  { id: "intro", href: "/", label: "Introduction", children: INTRO_CHILDREN },
  { id: "publications", href: "/#publications", label: "Publications" },
  { id: "patents", href: "/#patents", label: "Patents" },
  {
    id: "people",
    href: "/#people",
    label: "People",
    children: [
      { id: "people-professor", label: "Professor" },
      { id: "people-current", label: "Current Members" },
      { id: "people-alumni", label: "Alumni" },
    ],
  },
  { id: "seminars", href: "/#seminars", label: "Seminars" },
];

// 공통 패널 스타일 (다크 유리 + 하늘색 링)
const PANEL =
  "border-sky-400/25 bg-slate-900/90 shadow-xl shadow-sky-500/10 ring-1 ring-black/40 backdrop-blur-md";

export function QuickNav() {
  const [current, setCurrent] = useState("intro");
  const [subCurrent, setSubCurrent] = useState("");

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
      // 현재 섹션의 세부 위치 판정
      let sub = "";
      const children = ITEMS.find((it) => it.id === cur)?.children;
      if (children) {
        for (const { id } of children) {
          const el = document.getElementById(id);
          if (!el) continue;
          if (el.getBoundingClientRect().top + window.scrollY <= probe) sub = id;
        }
      }
      setCurrent(cur);
      setSubCurrent(sub);
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

  const subClass = (active: boolean) =>
    // 리모콘 폭에 맞는 작은 글씨 + 넘치면 말줄임
    "max-w-full truncate whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition " +
    "md:w-full md:text-left md:text-[11px] " +
    (active
      ? "bg-sky-400/20 text-sky-300"
      : "text-slate-300 hover:bg-sky-400/15 hover:text-sky-300");

  const activeParent = ITEMS.find((it) => it.id === current);
  const activeChildren = activeParent?.children;

  return (
    <>
      {/* ── 세부 리모콘 (별도 패널) ───────────────────────── */}
      {activeChildren && (
        <nav
          aria-label="Section navigation"
          className={
            `fixed z-50 ${PANEL} ` +
            // 모바일: 하단 메인 바 위에 떠 있는 알약 바
            "inset-x-2 bottom-[3.4rem] flex flex-row items-center gap-0.5 overflow-x-auto rounded-xl border p-1 " +
            // 데스크톱: 메인 리모콘 왼쪽의 세로 패널
            "md:inset-x-auto md:bottom-auto md:right-[11.75rem] md:top-1/2 md:w-40 md:-translate-y-1/2 md:flex-col md:items-stretch md:overflow-visible md:rounded-2xl md:p-2"
          }
        >
          <p className="hidden border-b border-white/10 px-2.5 pb-1.5 pt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:block">
            {activeParent.label}
          </p>
          {activeChildren.map((c) => (
            <Link
              key={c.id}
              href={`/#${c.id}`}
              className={subClass(subCurrent === c.id)}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      )}

      {/* ── 메인 리모콘 ──────────────────────────────────── */}
      <nav
        aria-label="Quick navigation"
        className={
          `fixed z-50 flex items-center gap-0.5 ${PANEL} ` +
          // 모바일: 화면에 딱 붙는 전폭 하단 바 (+ 아이폰 안전영역 패딩)
          "inset-x-0 bottom-0 flex-row overflow-x-auto rounded-none border-x-0 border-b-0 border-t p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] " +
          // 데스크톱: 오른쪽 세로 리모콘
          "md:inset-x-auto md:bottom-auto md:right-4 md:top-1/2 md:w-40 md:-translate-y-1/2 md:flex-col md:overflow-visible md:rounded-2xl md:border md:p-2"
        }
      >
        <button
          type="button"
          onClick={toTop}
          className={`hidden md:block ${itemClass(false)}`}
        >
          ↑ Top
        </button>

        <div className="my-1 hidden h-px w-full bg-white/10 md:block" />

        {ITEMS.map((it) => (
          <Link key={it.id} href={it.href} className={itemClass(current === it.id)}>
            {it.label}
          </Link>
        ))}

        <div className="my-1 hidden h-px w-full bg-white/10 md:block" />

        <button
          type="button"
          onClick={toBottom}
          className={`hidden md:block ${itemClass(false)}`}
        >
          ↓ Bottom
        </button>
      </nav>
    </>
  );
}
