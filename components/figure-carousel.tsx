"use client";
// 연구소개 figure 뷰어 — 파트당 한 장씩, 화살표/도트로 전후 넘김 (PDF 넘기듯)
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Figure } from "@/lib/figures";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      {dir === "left" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}

export function FigureCarousel({ figures }: { figures: Figure[] }) {
  const [idx, setIdx] = useState(0);
  const cur = figures[idx];
  const many = figures.length > 1;

  const arrowClass =
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-md transition " +
    "hover:bg-sky-400/30 disabled:opacity-25 disabled:hover:bg-white/10";

  return (
    <div>
      {/* 캡션 + 페이지 표시 */}
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h4 className="flex min-w-0 items-center gap-3 text-2xl font-bold tracking-tight text-white">
          <span className="h-6 w-1.5 shrink-0 rounded-full bg-sky-400" />
          <span className="truncate">{cur.label}</span>
        </h4>
        {many && (
          <span className="shrink-0 font-mono text-sm text-slate-400">
            {idx + 1} / {figures.length}
          </span>
        )}
      </div>

      {/* 송출 화면 */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/70 shadow-2xl shadow-black/40 ring-1 ring-white/10">
        <div className="relative aspect-[16/10]">
          <AnimatePresence mode="wait" initial={false}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={cur.src}
              src={cur.src}
              alt={cur.label}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-contain p-2"
            />
          </AnimatePresence>
        </div>

        {many && (
          <>
            <button
              type="button"
              aria-label="Previous figure"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              className={`${arrowClass} left-4`}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              aria-label="Next figure"
              disabled={idx === figures.length - 1}
              onClick={() => setIdx((i) => Math.min(figures.length - 1, i + 1))}
              className={`${arrowClass} right-4`}
            >
              <Chevron dir="right" />
            </button>
          </>
        )}
      </div>

      {/* 도트 내비게이션 */}
      {many && (
        <div className="mt-5 flex justify-center gap-2">
          {figures.map((f, i) => (
            <button
              key={f.src}
              type="button"
              aria-label={f.label}
              onClick={() => setIdx(i)}
              className={
                "h-2.5 rounded-full transition-all " +
                (i === idx
                  ? "w-8 bg-sky-400"
                  : "w-2.5 bg-white/25 hover:bg-white/50")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
