"use client";
// 히어로용 3D 뇌 모양 뉴럴 그래프 — 캔버스 포인트 클라우드
// - 대뇌 반구 2개(중앙 틈) + 소뇌를 타원체 표면 샘플로 구성
// - 근접 노드끼리 엣지 연결, Y축으로 천천히 회전 + 노드 점멸
// - 시드 고정 랜덤이라 매 로드 동일한 형태, 외부 라이브러리 없음
import { useEffect, useRef } from "react";

export function BrainGraph({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── 시드 고정 의사난수 ──
    let seed = 20250904;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    type P = { x: number; y: number; z: number; r: number; ph: number };
    const pts: P[] = [];

    // 대뇌 반구 2개 — 앞뒤(x)로 긴 타원체, 좌우(z)로 살짝 분리
    for (let h = 0; h < 2; h++) {
      const side = h === 0 ? 1 : -1;
      for (let i = 0; i < 150; i++) {
        const u = rand() * Math.PI * 2;
        const v = Math.acos(2 * rand() - 1);
        let x = Math.sin(v) * Math.cos(u) * 1.25;
        let y = Math.cos(v) * 0.92;
        let z = Math.sin(v) * Math.sin(u) * 0.78;
        z = side * (Math.abs(z) * 0.92 + 0.06); // 반구 사이 중앙 틈
        if (y > 0.55) y = 0.55 + (y - 0.55) * 0.25; // 바닥(아래쪽) 평평하게
        y += x * x * 0.05; // 앞뒤 끝이 살짝 내려가는 곡률
        pts.push({ x, y, z, r: 1.2 + rand() * 1.6, ph: rand() * Math.PI * 2 });
      }
    }
    // 소뇌 — 뒤쪽 아래 작은 타원체
    for (let i = 0; i < 42; i++) {
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      pts.push({
        x: -0.98 + Math.sin(v) * Math.cos(u) * 0.4,
        y: 0.58 + Math.cos(v) * 0.28,
        z: Math.sin(v) * Math.sin(u) * 0.52,
        r: 1.1 + rand() * 1.2,
        ph: rand() * Math.PI * 2,
      });
    }

    // ── 근접 엣지 (3D 거리 기준, 노드당 최대 3개) ──
    const edges: Array<[number, number]> = [];
    const deg = new Array(pts.length).fill(0);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (deg[i] >= 3) break;
        if (deg[j] >= 3) continue;
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dz = pts[i].z - pts[j].z;
        if (dx * dx + dy * dy + dz * dz < 0.14) {
          edges.push([i, j]);
          deg[i]++;
          deg[j]++;
        }
      }
    }

    // ── 렌더 ──
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const tiltX = -0.32; // 살짝 위에서 내려다보는 3/4 시점
    const cosT = Math.cos(tiltX);
    const sinT = Math.sin(tiltX);
    const px = new Float32Array(pts.length);
    const py = new Float32Array(pts.length);
    const pz = new Float32Array(pts.length);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const a = t * 0.00022; // 회전 속도
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const scale = Math.min(W, H) * 0.34;
      const cx = W / 2;
      const cy = H / 2;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // Y축 회전 → X축 틸트 → 원근 투영
        const x1 = p.x * cosA + p.z * sinA;
        const z1 = -p.x * sinA + p.z * cosA;
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;
        const persp = 1 / (1 + z2 * 0.28);
        px[i] = cx + x1 * scale * persp;
        py[i] = cy + y2 * scale * persp;
        pz[i] = z2; // -1(앞) ~ 1(뒤)
      }

      // 엣지 — 앞쪽일수록 진하게
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        const depth = (pz[i] + pz[j]) / 2;
        const alpha = 0.05 + Math.max(0, 0.6 - depth * 0.4) * 0.35;
        ctx.strokeStyle = `rgba(56,189,248,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.stroke();
      }
      // 노드 — 깊이별 크기·투명도 + 은은한 점멸
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const depthK = Math.max(0.15, 1 - (pz[i] + 1) * 0.42);
        const pulse = 0.75 + 0.25 * Math.sin(t * 0.0016 + p.ph);
        ctx.fillStyle = `rgba(125,211,252,${(depthK * pulse * 0.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px[i], py[i], p.r * depthK * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    if (reduced) {
      draw(0); // 정지 1프레임
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
