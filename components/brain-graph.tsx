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

    // 광원 주위를 3D 로 공전하며 떠오르는 빛 입자 (모트)
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const motes = Array.from({ length: 26 }, () => ({
      a0: rand() * Math.PI * 2, // 시작 각도
      r: 0.12 + rand() * 0.55, // 공전 반경
      spin: 0.5 + rand() * 1.2, // 공전 속도
      up: 0.35 + rand() * 0.8, // 상승 속도
      ph: rand(), // 수명 위상
      sz: 0.8 + rand() * 1.4, // 크기
    }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const a = t * 0.0002; // 약 31초에 한 바퀴
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const scale = Math.min(W, H) * 0.36;
      const cx = W / 2;
      const cy = H / 2;

      // 모델 공간 → 화면 투영 (버텍스와 동일한 카메라)
      const proj = (x: number, y: number, z: number): [number, number, number] => {
        const x1 = x * cosA + z * sinA;
        const z1 = -x * sinA + z * cosA;
        const y2 = y * cosT - z1 * sinT;
        const z2 = y * sinT + z1 * cosT;
        const persp = 1 / (1 + z2 * 0.22);
        return [cx + x1 * scale * persp, cy + y2 * scale * persp, persp];
      };


      // ── 한 점 광원 — 뇌와 같은 3D 카메라로 투영한 오브 + 원근 바닥광 ──
      const LY = 1.32; // 광원 높이 (모델 공간, 뇌 아래)
      const flick =
        0.78 +
        0.13 * Math.sin(t * 0.003) +
        0.06 * Math.sin(t * 0.0071 + 1.3) +
        0.05 * Math.sin(t * 0.0113 + 2.1);
      const flick2 =
        0.8 + 0.12 * Math.sin(t * 0.0026 + 0.7) + 0.08 * Math.sin(t * 0.0093 + 3.0);
      {
        const [lx, ly, lp] = proj(0, LY, 0);
        const S = scale * lp; // 원근 반영 크기
        // 바닥에 퍼지는 빛 — 틸트각만큼 눌린 타원 (원근 그라운드)
        ctx.save();
        ctx.translate(lx, ly + S * 0.04);
        ctx.scale(1, Math.abs(sinT) + 0.12);
        const gf = ctx.createRadialGradient(0, 0, 0, 0, 0, S * 0.85);
        gf.addColorStop(0, `rgba(125,211,252,${(0.28 * flick2).toFixed(3)})`);
        gf.addColorStop(0.45, `rgba(56,189,248,${(0.12 * flick2).toFixed(3)})`);
        gf.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = gf;
        ctx.beginPath();
        ctx.arc(0, 0, S * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // 빛기둥 — 세로로 길쭉한 라디얼 2겹 (직선 에지 없이 강한 기둥)
        // 바깥: 넓게 퍼지는 외광
        ctx.save();
        ctx.translate(lx, ly - S * 0.75);
        ctx.scale(0.42, 1.75);
        let gu = ctx.createRadialGradient(0, 0, 0, 0, 0, S * 0.8);
        gu.addColorStop(0, `rgba(56,189,248,${(0.3 * flick).toFixed(3)})`);
        gu.addColorStop(0.6, `rgba(56,189,248,${(0.12 * flick).toFixed(3)})`);
        gu.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = gu;
        ctx.beginPath();
        ctx.arc(0, 0, S * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // 안쪽: 좁고 밝은 코어 기둥
        ctx.save();
        ctx.translate(lx, ly - S * 0.7);
        ctx.scale(0.16, 1.7);
        gu = ctx.createRadialGradient(0, 0, 0, 0, 0, S * 0.75);
        gu.addColorStop(0, `rgba(186,230,253,${(0.55 * flick).toFixed(3)})`);
        gu.addColorStop(0.55, `rgba(125,211,252,${(0.22 * flick).toFixed(3)})`);
        gu.addColorStop(1, "rgba(125,211,252,0)");
        ctx.fillStyle = gu;
        ctx.beginPath();
        ctx.arc(0, 0, S * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        const layers: Array<[number, string]> = [
          [S * 0.42 * flick2, `rgba(56,189,248,${(0.24 * flick2).toFixed(3)})`],
          [S * 0.2 * flick, `rgba(125,211,252,${(0.45 * flick).toFixed(3)})`],
          [S * 0.08 * flick2, `rgba(224,242,254,${(0.9 * flick).toFixed(3)})`],
        ];
        for (const [r, c] of layers) {
          const g2 = ctx.createRadialGradient(lx, ly - r * 0.15, 0, lx, ly, r);
          g2.addColorStop(0, c);
          g2.addColorStop(1, "rgba(56,189,248,0)");
          ctx.fillStyle = g2;
          ctx.beginPath();
          ctx.arc(lx, ly, r, 0, Math.PI * 2);
          ctx.fill();
        }
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

      // ── 빛 입자 — 광원에서 3D 로 공전하며 떠올라 소멸 (회전 시 시차로 입체감) ──
      for (const mo of motes) {
        const cyc = (t * 0.00005 * mo.up + mo.ph) % 1; // 0(광원) → 1(소멸)
        const ang = mo.a0 + t * 0.0005 * mo.spin;
        const mx = Math.cos(ang) * mo.r * (0.4 + cyc * 0.8);
        const mz = Math.sin(ang) * mo.r * (0.4 + cyc * 0.8);
        const my = LY - 0.12 - cyc * 0.75;
        const [sx2, sy2, sp2] = proj(mx, my, mz);
        const alpha = Math.sin(Math.PI * cyc) * 0.55 * flick;
        if (alpha <= 0.01) continue;
        ctx.fillStyle = `rgba(186,230,253,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx2, sy2, mo.sz * sp2 * (scale / 150), 0, Math.PI * 2);
        ctx.fill();
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
