"use client";
// 히어로용 3D 뇌 — 삼각 메쉬(low-poly) 와이어프레임, 천천히 Y축 회전
// - UV 스피어를 뇌 비율로 변형: 앞뒤로 길게, 반구 홈, 평평한 바닥, 표면 굴곡 + 소뇌
// - 화면 투영 후 백페이스 컬링 → 앞면만 그려서 겹침 없이 정돈된 메쉬로 보임
// - 외부 라이브러리 없음, prefers-reduced-motion 시 정지 프레임
import { useEffect, useRef } from "react";

export function BrainGraph({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type V = { x: number; y: number; z: number };
    const verts: V[] = [];
    const tris: Array<[number, number, number]> = [];

    // UV 스피어 → 뇌 변형 메쉬 생성 (캔버스 좌표: +y 아래)
    const addEllipsoid = (
      lon: number,
      lat: number,
      shape: (x: number, y: number, z: number, u: number, v: number) => V,
    ) => {
      const base = verts.length;
      for (let j = 0; j <= lat; j++) {
        const v = (j / lat) * Math.PI;
        for (let i = 0; i < lon; i++) {
          const u = (i / lon) * Math.PI * 2;
          const sx = Math.sin(v) * Math.cos(u);
          const sy = Math.cos(v); // +1 = 화면 아래
          const sz = Math.sin(v) * Math.sin(u);
          verts.push(shape(sx, sy, sz, u, v));
        }
      }
      for (let j = 0; j < lat; j++) {
        for (let i = 0; i < lon; i++) {
          const a = base + j * lon + i;
          const b = base + j * lon + ((i + 1) % lon);
          const c = base + (j + 1) * lon + i;
          const d = base + (j + 1) * lon + ((i + 1) % lon);
          tris.push([a, b, c], [b, d, c]);
        }
      }
    };

    // 대뇌 — 앞뒤(x)로 긴 타원체 + 굴곡 + 반구 홈 + 평평한 바닥
    addEllipsoid(24, 16, (sx, sy, sz, u, v) => {
      // 표면 굴곡(주름 느낌) — 결정적 사인 노이즈, 과하지 않게
      const bump =
        1 +
        0.05 * Math.sin(4 * u + 2 * v) * Math.sin(3 * v + 1.7) +
        0.03 * Math.sin(7 * u + 0.9) * Math.sin(5 * v);
      let x = sx * 1.3 * bump;
      let y = sy * 0.95 * bump;
      let z = sz * 0.85 * bump;
      // 반구 홈 — 윗부분(y<0)의 중앙선(z≈0) 근처를 살짝 오므림
      if (y < 0.1) z *= 1 - 0.35 * Math.exp(-(z * z) / 0.045);
      // 바닥 평평하게
      if (y > 0.42) y = 0.42 + (y - 0.42) * 0.3;
      // 앞뒤 끝이 살짝 처지는 곡률 (측두엽 라인)
      y += x * x * 0.06;
      return { x, y, z };
    });
    // 소뇌 — 뒤쪽(-x) 아래 작은 메쉬
    addEllipsoid(12, 8, (sx, sy, sz) => ({
      x: -1.02 + sx * 0.44,
      y: 0.52 + sy * 0.3,
      z: sz * 0.55,
    }));

    // ── 렌더 ──
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const tiltX = -0.3; // 살짝 위에서 보는 3/4 시점
    const cosT = Math.cos(tiltX);
    const sinT = Math.sin(tiltX);
    const px = new Float32Array(verts.length);
    const py = new Float32Array(verts.length);
    const pz = new Float32Array(verts.length);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const a = t * 0.00022; // 약 28초에 한 바퀴
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const scale = Math.min(W, H) * 0.33;
      const cx = W / 2;
      const cy = H / 2;

      for (let i = 0; i < verts.length; i++) {
        const p = verts[i];
        const x1 = p.x * cosA + p.z * sinA;
        const z1 = -p.x * sinA + p.z * cosA;
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;
        const persp = 1 / (1 + z2 * 0.25);
        px[i] = cx + x1 * scale * persp;
        py[i] = cy + y2 * scale * persp;
        pz[i] = z2;
      }

      ctx.lineWidth = 0.8;
      ctx.lineJoin = "round";
      for (const [i, j, k] of tris) {
        // 화면 좌표 winding 으로 백페이스 컬링 (앞면만)
        const cross =
          (px[j] - px[i]) * (py[k] - py[i]) - (py[j] - py[i]) * (px[k] - px[i]);
        if (cross <= 0) continue;
        const depth = (pz[i] + pz[j] + pz[k]) / 3; // -1(앞) ~ 1(뒤)
        const k1 = Math.max(0, 0.75 - depth * 0.45);
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.lineTo(px[k], py[k]);
        ctx.closePath();
        ctx.fillStyle = `rgba(56,189,248,${(0.028 + k1 * 0.05).toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(125,211,252,${(0.1 + k1 * 0.3).toFixed(3)})`;
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
