import { SeverityBadge } from "@/components/ui/Badges";
import { EmptyState } from "@/components/ui/States";
import { fmtCoord, shortId } from "@/lib/format";
import type { Pothole } from "@/lib/types/models";

/** Server-reported repairs and dashboard-only repairs marked during this session. */
export function CompletedRepairs({ potholes }: { potholes: Pothole[] }) {
  const done = potholes
    .filter((p) => p.status === "fixed")
    .sort((a, b) => (b.fixed_at ?? "").localeCompare(a.fixed_at ?? ""));

  if (done.length === 0) {
    return <EmptyState title="No repairs completed yet">Mark a queue item fixed to move it here for this session. Dashboard-only changes reset when the page reloads.</EmptyState>;
  }
  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-sm text-slate-600">{done.length} repair{done.length === 1 ? "" : "s"} completed. Newest first.</p>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2">Flag</th>
            <th className="px-2 py-2">Pothole</th>
            <th className="px-2 py-2">Location</th>
            <th className="px-2 py-2">Was</th>
            <th className="px-2 py-2">Completed</th>
          </tr>
        </thead>
        <tbody>
          {done.slice(0, 50).map((p) => (
            <tr key={p.id} className="border-b border-slate-100">
              <td className="px-2 py-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">✔ Work done</span>
              </td>
              <td className="px-2 py-2 font-mono text-xs">{shortId(p.id)}</td>
              <td className="px-2 py-2">
                {fmtCoord(p.lat)}, {fmtCoord(p.lng)}
                {p.ward_id && <span className="block text-xs text-slate-500">{p.ward_id}</span>}
              </td>
              <td className="px-2 py-2">
                <SeverityBadge bucket={p.severity_bucket} score={p.severity} />
              </td>
              <td className="px-2 py-2">{p.fixed_at ? new Date(p.fixed_at).toLocaleString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
