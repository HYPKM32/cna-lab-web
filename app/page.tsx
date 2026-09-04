import Link from "next/link";
import { Suspense } from "react";
import { getStats, getPublications } from "@/lib/data";
import { PublicationsBrowser } from "@/components/publications-browser";
import { PatentsBrowser } from "@/components/patents-browser";
import { LecturesBrowser } from "@/components/lectures-browser";
import PeopleSection from "./people/page";
import { getResearchSections } from "@/lib/figures";
import { SITE } from "@/lib/labels";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { UnderlineDraw } from "@/components/underline-draw";

export default async function HomePage() {
  const stats = getStats();
  // 하이라이트는 CMS 에서 체크된 것 중 최신순 (정렬은 data 레이어에서 연도↓)
  const highlights = getPublications("highlight");
  const research = await getResearchSections();

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        {/* 배너 이미지 대체 배경 — 그라데이션 + 청사진 그리드 + 오로라 광원 + 뉴럴 네트워크 */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0b1a33] to-slate-950" />
        {/* 청사진 그리드 — 중앙만 보이고 가장자리로 페이드 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_72%)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(125,211,252,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,.5) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        {/* 천천히 흐르는 오로라 광원 */}
        <div className="hero-blob-a pointer-events-none absolute -top-40 right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-sky-500/30 blur-[110px]" />
        <div className="hero-blob-b pointer-events-none absolute bottom-[-10rem] left-[8%] h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[110px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 rounded-full bg-indigo-500/15 blur-[100px]" />
        {/* 뉴럴 네트워크 모티프 — 오른쪽, 노드가 은은하게 점멸 */}
        <svg
          className="pointer-events-none absolute right-[3%] top-1/2 hidden h-[26rem] w-[30rem] -translate-y-1/2 opacity-70 md:block"
          viewBox="0 0 480 420"
          fill="none"
          aria-hidden
        >
          <g stroke="#38bdf8" strokeWidth="1">
            <path d="M30 70 190 40M30 70 190 140M30 170 190 140M30 170 190 240M30 270 190 240M30 270 190 340M30 350 190 340" strokeOpacity="0.18" />
            <path d="M190 40 340 90M190 140 340 90M190 140 340 210M190 240 340 210M190 240 340 330M190 340 340 330" strokeOpacity="0.22" />
            <path d="M340 90 450 160M340 210 450 160M340 210 450 260M340 330 450 260" strokeOpacity="0.28" />
          </g>
          <g fill="#7dd3fc">
            <circle cx="30" cy="70" r="4" opacity="0.55" />
            <circle className="hero-node" cx="30" cy="170" r="5" />
            <circle cx="30" cy="270" r="4" opacity="0.45" />
            <circle cx="30" cy="350" r="3.5" opacity="0.5" />
            <circle className="hero-node" cx="190" cy="40" r="4" style={{ animationDelay: "1.2s" }} />
            <circle cx="190" cy="140" r="5" opacity="0.6" />
            <circle cx="190" cy="240" r="4" opacity="0.5" />
            <circle className="hero-node" cx="190" cy="340" r="4" style={{ animationDelay: "2.6s" }} />
            <circle cx="340" cy="90" r="4.5" opacity="0.6" />
            <circle className="hero-node" cx="340" cy="210" r="5.5" style={{ animationDelay: "0.6s" }} />
            <circle cx="340" cy="330" r="4" opacity="0.5" />
            <circle className="hero-node" cx="450" cy="160" r="6" style={{ animationDelay: "1.8s" }} />
            <circle cx="450" cy="260" r="5" opacity="0.65" />
          </g>
        </svg>
        {/* 아래 섹션(#overview, slate-950)으로 자연스럽게 이어지는 페이드 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-950" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-44">
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
      {/* 모바일/태블릿: 겹침 없이 이어붙임, 데스크톱(lg+)에서만 배너 위로 끌어올림 */}
      <section id="overview" className="relative z-10 scroll-mt-20 bg-slate-950 lg:-mt-28">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-10 lg:pt-8">
          {/* 통계 — 헤어라인으로 나뉜 가로 밴드 (숫자 위·라벨 아래) */}
          <Reveal className="min-w-0">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/15 backdrop-blur-md md:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "SCI(E) Journals", value: stats.sciJournals },
                { label: "Intl. Conferences", value: stats.intlConfs },
                { label: "Patents", value: stats.patents },
                { label: "Current Members", value: stats.currentMembers },
                { label: "Alumni", value: stats.alumni },
                { label: "Seminars", value: stats.lectures },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col-reverse items-center justify-center gap-1 bg-slate-900/80 px-3 py-5 transition hover:bg-slate-900/60"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {s.label}
                  </dt>
                  <dd className="text-3xl font-bold tracking-tight text-white">
                    <CountUp to={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* 하이라이트 — 통계 밴드 아래 전폭 카드 */}
          {highlights.length > 0 && (
            <Reveal delay={0.1} className="mt-6 block min-w-0">
              <div className="relative flex flex-col overflow-hidden rounded-2xl bg-slate-900/70 p-6 ring-1 ring-sky-400/20 backdrop-blur-md">
                {/* 상단 얇은 하늘색 액센트 라인 */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
                <div className="relative mb-4 flex items-baseline justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
                    <span className="text-sky-300">★</span>
                    Highlighted Publications
                  </h2>
                  {/* 원페이지: 필터를 Highlights 로 바꾸고 Publications 섹션으로 스크롤 */}
                  <Link
                    href="/?type=highlight#publications"
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
        {/* md+: 메인 리모콘(right-4 + w-40 = 11rem)에 딱 안 가릴 만큼만 오른쪽 여백 */}
        <div className="mx-auto max-w-[90rem] px-6 pb-24 pt-6 md:pr-44">
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

          <div className="mt-20 space-y-24">
            {research.map((sec, i) => (
              <div
                key={sec.title}
                id={`research-${i + 1}`}
                className="grid scroll-mt-24 gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14"
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

                {/* 자료 — 슬라이드 대신 전부 세로로 나열 (한 스크롤에 전체 노출) */}
                <div>
                  {sec.figures.length > 0 ? (
                    <div className="space-y-7">
                      {sec.figures.map((f, j) => (
                        <Reveal key={f.src}>
                          {/* 정갈한 프레임: 순번·제목 캡션 바 + 이미지 */}
                          <figure className="overflow-hidden rounded-2xl bg-slate-950/60 ring-1 ring-white/10 transition hover:ring-sky-400/40">
                            <figcaption className="flex items-center gap-3 border-b border-white/5 bg-white/[0.03] px-5 py-3">
                              <span className="shrink-0 font-mono text-[11px] font-semibold tracking-widest text-sky-400">
                                {String(j + 1).padStart(2, "0")}
                                <span className="text-slate-500">
                                  {" "}/ {String(sec.figures.length).padStart(2, "0")}
                                </span>
                              </span>
                              <span className="h-4 w-px shrink-0 bg-white/15" />
                              <span className="truncate text-base font-semibold text-slate-100 md:text-lg">
                                {f.label}
                              </span>
                            </figcaption>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={f.src}
                              alt={f.label}
                              loading="lazy"
                              className="w-full"
                            />
                          </figure>
                        </Reveal>
                      ))}
                    </div>
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

        {/* 다크 → 화이트 전환 (이후 밝은 섹션들로 이어짐) */}
        <div className="h-32 bg-gradient-to-b from-slate-900 to-white" />
      </section>

      {/* ── 원페이지 섹션: 논문 ── */}
      <section id="publications" className="scroll-mt-14">
        <Suspense>
          <PublicationsBrowser />
        </Suspense>
      </section>

      <SectionDivider />

      {/* ── 특허 ── */}
      <section id="patents" className="scroll-mt-14">
        <PatentsBrowser />
      </section>

      <SectionDivider />

      {/* ── 구성원 ── */}
      <section id="people" className="scroll-mt-14">
        <PeopleSection />
      </section>

      <SectionDivider />

      {/* ── 세미나 ── */}
      <section id="seminars" className="scroll-mt-14">
        <LecturesBrowser />
      </section>
    </>
  );
}

// 대분류 섹션 사이 구분선 — 중앙이 진하고 양끝으로 사라지는 그라데이션 헤어라인
function SectionDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="mx-auto -mt-[3px] h-1.5 w-24 rounded-full bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
    </div>
  );
}
