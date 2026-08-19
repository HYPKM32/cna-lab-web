import type { Metadata } from "next";
import { getPeople, type Person } from "@/lib/data";
import { asset } from "@/lib/asset";
import { PEOPLE_GROUPS, SITE } from "@/lib/labels";

export const metadata: Metadata = { title: "People" };

function photoUrl(p: Person) {
  // 이관분: 'file/...' (sync-assets.sh 가 번들) / CMS 업로드분: '/uploads/cms/...'
  if (!p.photo_key) return null;
  return asset(
    p.photo_key.startsWith("/") ? p.photo_key : `/uploads/${p.photo_key}`,
  );
}

function initials(name: string) {
  return name.replace(/[,.].*$/, "").trim().slice(0, 2).toUpperCase();
}

function Photo({ p, className }: { p: Person; className: string }) {
  const photo = photoUrl(p);
  return (
    <div
      className={`overflow-hidden bg-gradient-to-br from-sky-100 to-indigo-100 ${className}`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={p.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-sky-400">
          {initials(p.name)}
        </div>
      )}
    </div>
  );
}

// ── 교수 피처드 카드 ─────────────────────────────────────────
function ProfessorCard({ p }: { p: Person }) {
  return (
    <div className="flex flex-col gap-8 rounded-3xl border-2 border-slate-900 bg-white p-8 sm:flex-row sm:items-center sm:p-10">
      <Photo
        p={p}
        className="h-44 w-44 shrink-0 rounded-2xl ring-1 ring-slate-200"
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
          Principal Investigator
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {p.name}
        </h2>
        {p.role && <p className="mt-1 text-lg text-slate-600">{p.role}</p>}
        {p.affiliation && (
          <p className="mt-1 text-sm text-slate-500">{p.affiliation}</p>
        )}
        {p.email && (
          <a
            href={`mailto:${p.email}`}
            className="mt-4 inline-block rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            {p.email}
          </a>
        )}
      </div>
    </div>
  );
}

// ── 현재 멤버: 사진 중심 세로 카드 ────────────────────────────
function MemberCard({ p }: { p: Person }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Photo p={p} className="aspect-square w-full" />
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{p.name}</h3>
        {p.role && (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{p.role}</p>
        )}
        {p.email && (
          <a
            href={`mailto:${p.email}`}
            className="mt-1.5 block truncate text-xs text-sky-600 hover:underline"
          >
            {p.email}
          </a>
        )}
      </div>
    </div>
  );
}

// ── 알럼나이: 조밀한 가로 리스트 ──────────────────────────────
function AlumnusRow({ p }: { p: Person }) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
      <Photo p={p} className="h-11 w-11 shrink-0 rounded-full" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
        {(p.role || p.affiliation) && (
          <p className="text-xs leading-relaxed text-slate-400">
            {p.role || p.affiliation}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PeoplePage() {
  const people = getPeople();

  const current = people.filter((p) => p.category === "current");
  // 교수: current 중 role 에 Professor 가 들어간 첫 사람
  const professor = current.find((p) => /professor/i.test(p.role ?? ""));
  const members = current.filter((p) => p !== professor);

  const undergrads = people.filter((p) => p.category === "undergraduate");
  const alumniGroups = PEOPLE_GROUPS.filter((g) => g.key.startsWith("alumni_"))
    .map((g) => ({ ...g, members: people.filter((p) => p.category === g.key) }))
    .filter((g) => g.members.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* 학술지 표지 느낌의 헤더 (Publications 와 통일) */}
      <header className="border-b-4 border-double border-slate-900 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
          {SITE.name} · Members
        </p>
        <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          People
        </h1>
        <p className="mt-4 font-serif text-lg italic text-slate-500">
          The researchers behind {SITE.full}
        </p>
      </header>

      {/* 교수 피처드 */}
      {professor && (
        <section id="people-professor" className="mt-12 scroll-mt-20">
          <ProfessorCard p={professor} />
        </section>
      )}

      {/* 현재 멤버 */}
      {members.length > 0 && (
        <section id="people-current" className="mt-16 scroll-mt-20">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Current Members
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {members.map((p) => (
              <MemberCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* 학부생 */}
      {undergrads.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Undergraduate
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {undergrads.map((p) => (
              <MemberCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* 알럼나이 — 조밀하게 */}
      {alumniGroups.length > 0 && (
        <section id="people-alumni" className="mt-20 scroll-mt-20">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Alumni</h2>
          <div className="mt-6 space-y-10">
            {alumniGroups.map((g) => (
              <div key={g.key}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-sky-700">
                  {g.label.replace("Alumni · ", "")}
                  <span className="ml-2 font-normal text-slate-400">
                    {g.members.length}
                  </span>
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                  {g.members.map((p) => (
                    <AlumnusRow key={p.id} p={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
