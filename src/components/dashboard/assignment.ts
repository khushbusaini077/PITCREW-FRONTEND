import type { Plan } from "@/lib/types/models";

export interface Assignment {
  crewId: string;
  crewName: string;
  colorIndex: number;
  sequence: number;
}

/** pothole_id -> crew/stop in the plan currently displayed. Derived, never stored (Constitution 4.4). */
export function buildAssignments(plan: Plan | null | undefined): Map<string, Assignment> {
  const m = new Map<string, Assignment>();
  for (const r of plan?.routes ?? [])
    for (const s of r.stops) m.set(s.pothole_id, { crewId: r.crew_id, crewName: r.crew_name, colorIndex: r.color_index, sequence: s.sequence });
  return m;
}
