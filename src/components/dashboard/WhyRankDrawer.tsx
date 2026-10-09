import { SeverityBadge, SourceBadge } from "@/components/ui/Badges";
import { Drawer } from "@/components/ui/Drawer";
import { crewColor } from "@/lib/constants";
import { fmt3, fmtCoord, shortId } from "@/lib/format";
import type { QueueItem } from "@/lib/types/models";
import type { Assignment } from "./assignment";

function Factor({ label, hint, value, bar }: { label: string; hint: string; value: string; bar?: number }) {
  return (
    <div className="rounded-sm border border-slate-200 p-3">
      <div className="flex items-baseline justify-between">
        <p className="font-medium">{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
      <p className="text-xs text-slate-600">{hint}</p>
      {bar !== undefined && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, bar * 100))}%` }} />
        </div>
      )}
    </div>
  );
}

function Reasons({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {items.map((r) => (
            <li key={r} className="rounded-md bg-slate-100 px-2 py-0.5 text-sm">
              {r}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-slate-500">None recorded.</p>
      )}
    </div>
  );
}

export function WhyRankDrawer({ item, assignment, onClose }: { item: QueueItem | null; assignment?: Assignment; onClose: () => void }) {
  const p = item?.pothole;
  return (
    <Drawer open={item !== null} title={item ? `Why rank #${item.rank}?` : "Why this rank?"} onClose={onClose}>
      {item && p && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{shortId(p.id)}</span>
            <SeverityBadge bucket={p.severity_bucket} score={p.severity} />
            <SourceBadge source={p.source} />
          </div>
          <p className="text-sm text-slate-700">
            Priority = severity × exposure × proximity × aging. The backend computes it; these are the values it returned.
          </p>
          <div className="space-y-2">
            <Factor label="Severity" hint="How dangerous the pothole is" value={fmt3(item.severity)} bar={item.severity} />
            <Factor label="× Exposure" hint="Nearby schools/hospitals, road class, confirmations" value={fmt3(item.exposure)} bar={item.exposure} />
            <Factor label="× Proximity" hint={`Closeness to the nearest crew (${item.nearest_crew_id})`} value={fmt3(item.proximity)} bar={item.proximity} />
            <Factor label="× Aging" hint="Multiplier for days open" value={`×${fmt3(item.aging_multiplier)}`} />
          </div>
          <div className="flex items-baseline justify-between rounded-sm bg-slate-900 px-4 py-3 text-white">
            <span>= Priority</span>
            <span className="text-2xl font-semibold tabular-nums">{fmt3(item.priority)}</span>
          </div>
          <Reasons title="Severity reasons" items={p.severity_reasons} />
          <Reasons title="Exposure reasons" items={p.exposure_reasons} />
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-600">Reports / sensor events</dt>
            <dd>
              {p.complaint_count} / {p.sensor_event_count}
            </dd>
            <dt className="text-slate-600">Confirmations</dt>
            <dd>{p.confirmation_count}</dd>
            <dt className="text-slate-600">Repair time</dt>
            <dd>{p.repair_minutes} min</dd>
            <dt className="text-slate-600">Location</dt>
            <dd>
              {fmtCoord(p.lat)}, {fmtCoord(p.lng)}
            </dd>
            <dt className="text-slate-600">Assigned crew</dt>
            <dd>
              {assignment ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: crewColor(assignment.colorIndex) }} />
                  {assignment.crewName} · stop {assignment.sequence}
                </span>
              ) : (
                "Unassigned"
              )}
            </dd>
          </dl>
        </div>
      )}
    </Drawer>
  );
}
