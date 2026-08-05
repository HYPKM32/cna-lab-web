"use client";
import { motion } from "motion/react";

// 히어로 제목 아래 그라데이션 라인이 왼쪽에서 스르륵 그어지는 장식
export function UnderlineDraw() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 h-1 w-40 origin-left rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-transparent sm:w-56"
    />
  );
}
