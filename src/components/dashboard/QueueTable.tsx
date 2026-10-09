"use client";
import { useState } from "react";
import { SeverityBadge } from "@/components/ui/Badges";
import { crewColor } from "@/lib/constants";
import { fmt3, fmtCoord, formatAge, shortId } from "@/lib/format";
import type { QueueItem } from "@/lib/types/models";
import { useNow } from "@/features/shared/hooks";
import type { Assignment } from "./assignment";

const PAGE = 25;

export function QueueTable({
  items,
  assignments,
  selectedId,
  onSelect,
  onWhy,
  onMarkFixed,
}: {
  items: QueueItem[];
  assignments: Map<string, Assignment>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onWhy: (item: QueueItem) => void;
  onMarkFixed: (item: QueueItem) => void;
}) {
  const now = useNow();
  const [shown, setShown] = useState(PAGE);
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr>
              {["#", "Pothole", "Severity", "Exposure", "Priority", "Location", "Age", "Assigned crew", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-2 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.slice(0, shown).map((it) => {
              const p = it.pothole;
              const a = assignments.get(p.id);
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${selectedId === p.id ? "bg-blue-50" : ""}`}
                >
                  <td className="px-2 py-2 tabular-nums">{it.rank}</td>
                  <td className="px-2 py-2 font-mono text-xs">{shortId(p.id)}</td>
                  <td className="px-2 py-2">
                    <SeverityBadge bucket={p.severity_bucket} score={p.severity} />
                  </td>
                  <td className="px-2 py-2 tabular-nums">{fmt3(it.exposure)}</td>
                  <td className="px-2 py-2 font-semibold tabular-nums">{fmt3(it.priority)}</td>
                  <td className="px-2 py-2 text-xs text-slate-700">
                    {fmtCoord(p.lat)}, {fmtCoord(p.lng)}
                    {p.ward_id && <span className="block text-slate-500">{p.ward_id}</span>}
                  </td>
                  <td className="px-2 py-2 tabular-nums">{formatAge(p.first_reported_at, now)}</td>
                  <td className="px-2 py-2">
                    {a ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: crewColor(a.colorIndex) }} aria-hidden="true" />
                        {a.crewName} · stop {a.sequence}
                      </span>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-2 py-2">{p.status === "fixed" ? "Fixed" : a ? "Assigned" : "Open"}</td>
                  <td className="whitespace-nowrap px-2 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onWhy(it);
                      }}
                      className="whitespace-nowrap rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-100"
                    >
                      Why this rank?
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkFixed(it);
                      }}
                      className="ml-2 whitespace-nowrap rounded-md border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50"
                    >
                      Mark fixed
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {shown < items.length && (
        <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mt-3 rounded-sm border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100">
          Show more ({items.length - shown} remaining)
        </button>
      )}
    </div>
  );
}
