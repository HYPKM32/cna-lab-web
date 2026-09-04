"use client";
// 히어로용 3D 뇌 — MNI152(ICBM152) 표준 뇌 표면의 low-poly 삼각 메쉬
// (brain-mesh-data.ts: BrainNet Viewer 메쉬를 vertex clustering 으로 데시메이션)
// 화면 winding 백페이스 컬링 + 깊이 셰이딩, Y축(상하축)으로 천천히 회전
import { useEffect, useRef } from "react";
import { BRAIN_VERTS, BRAIN_FACES } from "./brain-mesh-data";

export function BrainGraph({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nv = BRAIN_VERTS.length / 3;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const tiltX = -0.28; // 살짝 위에서 내려다보는 시점
    const cosT = Math.cos(tiltX);
    const sinT = Math.sin(tiltX);
    const px = new Float32Array(nv);
    const py = new Float32Array(nv);
    const pz = new Float32Array(nv);
    // 깊이순 정렬용 인덱스 버퍼 (뒤→앞으로 그려 앞면이 위에 오게)
    const order = new Uint16Array(BRAIN_FACES.length / 3);
    const depth = new Float32Array(BRAIN_FACES.length / 3);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const a = t * 0.0002; // 약 31초에 한 바퀴
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const scale = Math.min(W, H) * 0.36;
      const cx = W / 2;
      const cy = H / 2;

      // ── 한 점 광원 (뇌 아래) — 빛 자체가 일렁이는 3겹 글로우, 뇌와 겹치지 않음 ──
      {
        // 서로 다른 주파수의 사인 합 → 촛불처럼 일렁이는(찰랑이는) 빛
        const f1 =
          0.78 +
          0.13 * Math.sin(t * 0.003) +
          0.06 * Math.sin(t * 0.0071 + 1.3) +
          0.05 * Math.sin(t * 0.0113 + 2.1);
        const f2 =
          0.8 +
          0.12 * Math.sin(t * 0.0026 + 0.7) +
          0.08 * Math.sin(t * 0.0093 + 3.0);
        const baseY = cy + scale * 1.25; // 광원 한 점 (뇌 아래)
        const stopY = cy + scale * 0.5; // 빛이 뇌에 닿기 전 여기서 소멸
        // 위로 뻗다 사라지는 짧은 빛기둥
        const g = ctx.createLinearGradient(0, baseY, 0, stopY);
        g.addColorStop(0, `rgba(125,211,252,${(0.32 * f1).toFixed(3)})`);
        g.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx - scale * 0.16, baseY);
        ctx.lineTo(cx - scale * 0.42, stopY);
        ctx.lineTo(cx + scale * 0.42, stopY);
        ctx.lineTo(cx + scale * 0.16, baseY);
        ctx.closePath();
        ctx.fill();
        // 광원 글로우 3겹 (넓게 퍼짐 → 중간 → 밝은 코어), 납작한 타원
        ctx.save();
        ctx.translate(cx, baseY);
        ctx.scale(1, 0.34);
        const layers: Array<[number, string]> = [
          [scale * 0.55 * f2, `rgba(56,189,248,${(0.22 * f2).toFixed(3)})`],
          [scale * 0.3 * f1, `rgba(125,211,252,${(0.4 * f1).toFixed(3)})`],
          [scale * 0.12 * f2, `rgba(224,242,254,${(0.85 * f1).toFixed(3)})`],
        ];
        for (const [r, c] of layers) {
          const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
          g2.addColorStop(0, c);
          g2.addColorStop(1, "rgba(56,189,248,0)");
          ctx.fillStyle = g2;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      for (let i = 0; i < nv; i++) {
        const x = BRAIN_VERTS[i * 3];
        const y = BRAIN_VERTS[i * 3 + 1];
        const z = BRAIN_VERTS[i * 3 + 2];
        const x1 = x * cosA + z * sinA;
        const z1 = -x * sinA + z * cosA;
        const y2 = y * cosT - z1 * sinT;
        const z2 = y * sinT + z1 * cosT;
        const persp = 1 / (1 + z2 * 0.22);
        px[i] = cx + x1 * scale * persp;
        py[i] = cy + y2 * scale * persp;
        pz[i] = z2;
      }

      // 앞면만 모아 깊이 정렬 (뒤→앞)
      let m = 0;
      for (let f = 0; f < BRAIN_FACES.length; f += 3) {
        const i = BRAIN_FACES[f];
        const j = BRAIN_FACES[f + 1];
        const k = BRAIN_FACES[f + 2];
        const cross =
          (px[j] - px[i]) * (py[k] - py[i]) - (py[j] - py[i]) * (px[k] - px[i]);
        if (cross <= 0) continue;
        order[m] = f / 3;
        depth[f / 3] = (pz[i] + pz[j] + pz[k]) / 3;
        m++;
      }
      const vis = Array.from(order.subarray(0, m)).sort(
        (A, B) => depth[B] - depth[A],
      );

      ctx.lineWidth = 0.7;
      ctx.lineJoin = "round";
      for (const fi of vis) {
        const i = BRAIN_FACES[fi * 3];
        const j = BRAIN_FACES[fi * 3 + 1];
        const k = BRAIN_FACES[fi * 3 + 2];
        const d = depth[fi]; // -1(앞) ~ 1(뒤)
        const k1 = Math.max(0, 0.7 - d * 0.45);
        // 아래 조명 수광량 — 화면 중심보다 아래(fy>cy)일수록 빛을 받음
        const fy = (py[i] + py[j] + py[k]) / 3;
        const lit = Math.max(0, Math.min(1, (fy - cy) / (scale * 0.85)));
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.lineTo(px[k], py[k]);
        ctx.closePath();
        ctx.fillStyle = `rgba(${(12 + lit * 44) | 0},${(35 + lit * 105) | 0},${(64 + lit * 130) | 0},${(0.25 + k1 * 0.2).toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(125,211,252,${(0.07 + k1 * 0.26 + lit * 0.24).toFixed(3)})`;
        ctx.stroke();
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduced) {
      draw(0);
    } else {
      const loop = (t: number) => {
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
