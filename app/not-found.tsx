import Link from "next/link";

// 옛 그누보드 URL(sub*_*.php)로 들어온 방문자를 새 페이지로 자동 이동.
// HTTP 상태는 404 그대로라 구글은 옛 URL을 색인에서 제거하고,
// 사람은 알맞은 새 페이지로 넘어간다.
const legacyRedirect = `
(function () {
  var p = location.pathname;
  var rules = [
    [/^\\/sub2_6/, "/lectures/"],
    [/^\\/sub2_/, "/publications/"],
    [/^\\/sub3_/, "/people/"],
    [/\\.php$/, "/"],
  ];
  for (var i = 0; i < rules.length; i++) {
    if (rules[i][0].test(p)) { location.replace(rules[i][1]); return; }
  }
})();
`;

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start px-6 py-24">
      <script dangerouslySetInnerHTML={{ __html: legacyRedirect }} />
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
        404 · Page Not Found
      </p>
      <h1 className="mt-4 font-serif text-5xl font-bold tracking-tight text-slate-900">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-4 text-lg text-slate-500">
        주소가 바뀌었거나 삭제된 페이지입니다. 잠시 후 자동으로 이동하지 않으면
        아래 링크를 이용해 주세요.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {[
          { href: "/", label: "Home" },
          { href: "/publications", label: "Publications" },
          { href: "/people", label: "People" },
          { href: "/lectures", label: "Seminars" },
        ].map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-full bg-slate-100 px-5 py-2.5 text-base font-medium text-slate-600 transition hover:bg-slate-200"
          >
            {n.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
