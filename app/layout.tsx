import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { NetworkIcon } from "lucide-react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interface Hub",
  description: "금융사 인터페이스 중앙 관리 플랫폼",
};

const NAV_ITEMS: { label: string; href: string; disabled?: boolean; note?: string }[] = [
  { label: "인터페이스", href: "/interfaces" },
  { label: "실행 이력", href: "/executions" },
  { label: "대시보드", href: "/dashboard" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
            <Link
              href="/interfaces"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <NetworkIcon className="size-4" />
              </span>
              Interface Hub
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV_ITEMS.map((item) =>
                item.disabled ? (
                  <span
                    key={item.href}
                    className="px-3 py-1.5 rounded-md text-muted-foreground/70 cursor-not-allowed inline-flex items-center gap-1.5"
                    title={`${item.note}에서 활성화됩니다.`}
                  >
                    {item.label}
                    <span className="text-[10px] rounded bg-muted px-1.5 py-0.5 uppercase tracking-wide">
                      {item.note}
                    </span>
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
