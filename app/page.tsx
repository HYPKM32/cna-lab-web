import Link from "next/link";
import { getStats, getPublications } from "@/lib/data";
import { getResearchSections } from "@/lib/figures";
import { asset } from "@/lib/asset";
import { SITE } from "@/lib/labels";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { UnderlineDraw } from "@/components/underline-draw";

export default async function HomePage() {
  const stats = getStats();
  const allHighlights = getPublications("highlight");
  const research = await getResearchSections();
  // 하이라이트는 항상 최신 연도 것만 노출
  const latestYear = Math.max(...allHighlights.map((p) => p.year ?? 0));
  const highlights = allHighlights.filter((p) => p.year === latestYear);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        {/* 배너 이미지 배경 (살짝 밝고 선명하게) — 정적 export 라 plain img */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/hero-banner.png")}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center brightness-115 saturate-125"
        />
        {/* 가독성용 다크 오버레이 — 왼쪽 텍스트 영역만 강하게, 나머지는 옅게 해 이미지가 빛나도록 */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 py-32 sm:py-44">
          <Reveal>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-300">
              {SITE.name}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white [text-shadow:0_0_28px_rgba(56,189,248,0.45),0_0_72px_rgba(56,189,248,0.25)] sm:text-6xl">
              {SITE.full}
            </h1>
            <UnderlineDraw />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Neuroimaging, brain disorders &amp; SaMD, and AI for medical image
              analysis.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats + Highlights — 배너 위로 끌어올려 겹치되, 아래는 다크로 이어짐 */}
      <section className="relative z-10 -mt-24 bg-slate-950 sm:-mt-28">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-14 lg:grid-cols-[1fr_1.6fr]">
          {/* 통계 — 왼쪽 */}
          <Reveal>
            <dl className="grid h-full grid-cols-3 gap-3 lg:grid-cols-1">
              {[
                { label: "Publications", value: stats.publications },
                { label: "Members & Alumni", value: stats.people },
                { label: "Seminars", value: stats.lectures },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-slate-900/70 px-4 py-4 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-slate-900/80 lg:flex-row lg:justify-between lg:px-6"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:text-sm">
                    {s.label}
                  </dt>
                  <dd className="text-3xl font-bold tracking-tight text-white">
                    <CountUp to={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* 하이라이트 — 오른쪽, 항목당 한 줄 */}
          {highlights.length > 0 && (
            <Reveal delay={0.1}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-slate-900/70 p-6 ring-1 ring-sky-400/20 backdrop-blur-md">
                {/* 상단 얇은 하늘색 액센트 라인 */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
                <div className="relative mb-4 flex items-baseline justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
                    <span className="text-sky-300">★</span>
                    Highlighted Publications
                  </h2>
                  <Link
                    href="/publications?type=highlight"
                    className="text-sm font-medium text-sky-300 hover:text-sky-200"
                  >
                    See all →
                  </Link>
                </div>
                <ul className="relative flex flex-1 flex-col justify-center divide-y divide-white/10">
                  {highlights.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-3">
                      <span className="shrink-0 rounded-md bg-sky-400/15 px-2 py-0.5 text-xs font-bold text-sky-300">
                        {p.year}
                      </span>
                      {p.link_url ? (
                        <a
                          href={p.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-0 truncate text-sm font-medium text-slate-100 hover:text-sky-300"
                          title={p.title}
                        >
                          {p.title}
                        </a>
                      ) : (
                        <span
                          className="min-w-0 truncate text-sm font-medium text-slate-100"
                          title={p.title}
                        >
                          {p.title}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Research — 다크 흐름을 잇되, 구분선으로 위 섹션과 분리 */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
        {/* 하이라이트 ↔ 연구소개 구분선 (공간은 좁게, 선은 또렷하게) */}
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
        </div>
        <div className="mx-auto max-w-[90rem] px-6 pb-24 pt-6">
          <Reveal>
            <p className="text-base font-bold uppercase tracking-[0.3em] text-sky-400">
              Research
            </p>
            <h2 className="mt-3 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
              Where Neuroimaging{" "}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                Meets AI
              </span>
            </h2>
          </Reveal>

          <div className="mt-20 space-y-36">
            {research.map((sec, i) => (
              <div
                key={sec.title}
                className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14"
              >
                {/* 번호 + 파트 제목 — 데스크톱: 왼쪽에 고정(sticky), 스크롤하면 다음 파트로 교체 / 모바일: 위 */}
                <div>
                  <div className="lg:sticky lg:top-28">
                    <Reveal>
                      <span className="block bg-gradient-to-b from-sky-400/70 to-sky-400/5 bg-clip-text text-8xl font-black leading-none text-transparent sm:text-9xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                        {sec.title}
                      </h3>
                      <div className="mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-sky-400 to-transparent" />
                    </Reveal>
                  </div>
                </div>

                {/* 자료 — 각 이미지 상단에 소제목 */}
                <div className="space-y-20">
                  {sec.figures.length > 0 ? (
                    sec.figures.map((fig, j) => (
                      <Reveal key={fig.src} delay={j * 0.05}>
                        <figure>
                          <h4 className="mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight text-white">
                            <span className="h-6 w-1.5 rounded-full bg-sky-400" />
                            {fig.label}
                          </h4>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fig.src}
                            alt={fig.label}
                            loading="lazy"
                            className="w-full rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
                          />
                        </figure>
                      </Reveal>
                    ))
                  ) : (
                    <Reveal>
                      <p className="rounded-2xl border border-dashed border-white/15 p-10 text-base text-slate-500">
                        Figures coming soon.
                      </p>
                    </Reveal>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 다크 → 화이트 전환 (푸터로 자연스럽게) */}
        <div className="h-32 bg-gradient-to-b from-slate-900 to-white" />
      </section>
    </>
  );
}
