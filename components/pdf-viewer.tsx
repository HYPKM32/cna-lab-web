"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

interface PdfTarget {
  src: string;
  title: string;
}

const PdfCtx = createContext<(pdf: PdfTarget) => void>(() => {});

// 페이지를 감싸면 하위 어디서든 PdfViewButton 으로 오른쪽 뷰어를 열 수 있다
export function PdfViewerProvider({ children }: { children: ReactNode }) {
  const [pdf, setPdf] = useState<PdfTarget | null>(null);

  // ESC 로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPdf(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 뷰어 폭 — 본문 밀림 폭과 동일하게 유지
  const PANEL_W = "min(44rem, 88vw)";

  return (
    <PdfCtx.Provider value={setPdf}>
      {/* 뷰어가 열리면 본문이 왼쪽으로 밀림 (딤/블러 없음) */}
      <div
        className="transition-[margin-right] duration-300 ease-out"
        style={{ marginRight: pdf ? PANEL_W : 0 }}
      >
        {children}
      </div>
      <AnimatePresence>
        {pdf && (
          <>
            {/* 오른쪽 사이드 뷰어 */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: PANEL_W }}
              className="fixed inset-y-0 right-0 z-[61] flex flex-col border-l border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-300">
                    Document Preview
                  </span>
                  <span className="ml-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    CNA Lab
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPdf(null)}
                  className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-md transition hover:bg-sky-100"
                >
                  ✕ 닫기
                </button>
              </div>
              {/* toolbar=0 → 브라우저 PDF 뷰어의 다운로드/인쇄 버튼 숨김 */}
              <iframe
                src={`${pdf.src}#toolbar=0&navpanes=0`}
                title={pdf.title}
                className="w-full flex-1 bg-slate-100"
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </PdfCtx.Provider>
  );
}

export function PdfViewButton({ src, title }: PdfTarget) {
  const open = useContext(PdfCtx);
  return (
    <button
      type="button"
      onClick={() => open({ src, title })}
      className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-700"
    >
      {/* 깔끔한 라인 스타일 눈 아이콘 */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
      View
    </button>
  );
}
