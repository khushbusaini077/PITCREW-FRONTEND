import type { ReactNode } from "react";
import { describeError } from "@/lib/api/errorMessages";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="font-medium text-slate-800">{title}</p>
      {children && <p className="mt-1 text-sm text-slate-600">{children}</p>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
      <p className="font-medium">Could not load this data</p>
      <p className="mt-1">{describeError(error)}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded-md bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800">
          Retry
        </button>
      )}
    </div>
  );
}
