import Link from "next/link";
import { EmptyState } from "@/components/ui/States";
import { crewColor } from "@/lib/constants";
import { fmtMin } from "@/lib/format";
import type { Crew, Plan } from "@/lib/types/models";

export function CrewPanels({ plan, crews, crewCount, label }: { plan: Plan; crews: Crew[]; crewCount: number; label: string }) {
  if (plan.routes.length === 0) return <EmptyState title="No crew routes">The scheduler returned no routes for this plan.</EmptyState>;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600">
        {label} plan · {plan.unassigned_pothole_ids.length} potholes unassigned today
      </p>
      {plan.routes.map((r) => {
        const crew = crews.find((c) => c.id === r.crew_id);
        const total = r.shift_used_minutes + r.shift_remaining_minutes;
        const pct = total > 0 ? (r.shift_used_minutes / total) * 100 : 0;
        const color = crewColor(r.color_index);
        return (
          <article key={r.crew_id} className="rounded-sm border border-slate-200 p-3" style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{r.crew_name}</h3>
              <Link href={`/crew/${encodeURIComponent(r.crew_id)}?crews=${crewCount}`} className="text-sm font-medium text-[#2f7dc0] hover:underline">
                Open crew view
              </Link>
            </div>
            <p className="mt-1 text-sm text-slate-700">
              {r.stops.length} stops · travel {fmtMin(r.total_travel_minutes)} · repair {fmtMin(r.total_repair_minutes)}
            </p>
            <div className="mt-2 h-2 rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={`${r.crew_name} shift used`}>
              <div className="h-2 rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Shift {fmtMin(r.shift_used_minutes)} used, {fmtMin(r.shift_remaining_minutes)} left
              {crew ? ` · ${fmtMin(crew.minutes_used)} already worked today` : ""}
            </p>
          </article>
        );
      })}
    </div>
  );
}
