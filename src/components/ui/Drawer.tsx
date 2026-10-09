"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />
      <aside role="dialog" aria-modal="true" aria-label={title} className="relative h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="rounded-md border border-slate-300 px-2.5 py-1 text-sm hover:bg-slate-100">
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
