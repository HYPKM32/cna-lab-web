import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { QuickNav } from "@/components/quick-nav";
import { SITE } from "@/lib/labels";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: `${SITE.name} · ${SITE.full}`, template: `%s · ${SITE.name}` },
  description: `${SITE.full}, ${SITE.org}. Led by ${SITE.pi}.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <QuickNav />
      </body>
    </html>
  );
}
