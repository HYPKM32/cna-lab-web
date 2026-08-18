"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

// 화면에 보이면 0 → to 로 카운트업
// (뷰포트 감지가 실패하는 환경 대비: 2.5초 내 미감지 시 최종 값으로 스냅)
export function CountUp({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (!inView) {
      const fallback = setTimeout(() => {
        if (!done.current) setVal(to);
      }, 2500);
      return () => clearTimeout(fallback);
    }
    done.current = true;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return <span ref={ref}>{val}</span>;
}
