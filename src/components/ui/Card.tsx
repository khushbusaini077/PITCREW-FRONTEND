import type { ReactNode } from "react";

export function Card({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.035] ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {action}
        </header>
      )}
      <div className="min-w-0 p-3 sm:p-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, color }: { label: string; value: ReactNode; hint?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5" style={color ? { borderTopColor: color, borderTopWidth: 3 } : undefined}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
