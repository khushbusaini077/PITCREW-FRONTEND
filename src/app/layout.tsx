import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { StatusBanners } from "@/components/ui/StatusBanners";
import { ApiVersion } from "@/components/ui/ApiVersion";

export const metadata: Metadata = {
  title: "PITCREW",
  description: "AI-powered municipal pothole prioritization and crew scheduling.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const nav = [
  { href: "/report", label: "Citizen report" },
  { href: "/dashboard", label: "Municipality" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col text-slate-900 antialiased">
        <Providers>
          <StatusBanners />
          <header className="rw-header">
            <div className="rw-container flex min-h-16 items-center justify-between gap-3 py-3">
              <Link href="/" aria-label="PITCREW home" className="flex min-w-0 items-center gap-2.5 rounded-lg">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-700 text-lg font-extrabold text-white shadow-sm">P</span>
                <span className="min-w-0"><span className="block text-base font-extrabold leading-tight tracking-tight text-slate-900 sm:text-lg">PITCREW</span><span className="hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block">ROAD OPERATIONS PLATFORM</span></span>
              </Link>
              <nav aria-label="Main" className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-semibold">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-slate-700 hover:bg-white hover:text-teal-800 hover:shadow-sm sm:px-4">
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="rw-main flex-1">{children}</main>
          <footer className="rw-footer px-3 py-5 text-xs sm:px-6">
            <div className="rw-container flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Demo uses synthetic data. Map data © OpenStreetMap contributors.</span>
              <ApiVersion />
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
