import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { QuickNav } from "@/components/quick-nav";
import { SITE } from "@/lib/labels";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const SITE_URL = "https://cna.hanyang.ac.kr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE.name} · ${SITE.full}`, template: `%s · ${SITE.name}` },
  description: `${SITE.full}, ${SITE.org}. Led by ${SITE.pi}. Research on neuroimaging, brain disorders & SaMD, and AI for medical image analysis.`,
  keywords: [
    "CNA Lab",
    "Computational Neuroimaging",
    "한양대 CNA",
    "한양대학교 뇌영상 연구실",
    "Hanyang University",
    "neuroimaging",
    "brain MRI",
    "medical AI",
    "SaMD",
    "이종민 교수",
    "Jong-Min Lee",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.full}`,
    description: `${SITE.full}, ${SITE.org}. Led by ${SITE.pi}.`,
    images: [{ url: "/cna-logo.png" }],
  },
  robots: { index: true, follow: true },
};

// 구글 검색 결과에 기관 정보로 인식되도록 하는 구조화 데이터
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  name: SITE.full,
  alternateName: SITE.name,
  url: SITE_URL,
  logo: `${SITE_URL}/cna-logo.png`,
  parentOrganization: { "@type": "CollegeOrUniversity", name: "Hanyang University" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      {/* pb: 모바일 하단 퀵바에 푸터가 가리지 않도록 여백 */}
      <body className="flex min-h-full flex-col bg-white pb-14 font-sans text-slate-900 md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <QuickNav />
      </body>
    </html>
  );
}
