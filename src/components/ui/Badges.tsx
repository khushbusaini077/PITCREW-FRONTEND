import { SEVERITY_COLORS } from "@/lib/constants";
import type { PotholeSource, SeverityBucket } from "@/lib/types/models";

export function SeverityBadge({ bucket, score }: { bucket: SeverityBucket; score?: number }) {
  const color = SEVERITY_COLORS[bucket];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize text-slate-900"
      style={{ borderColor: color, backgroundColor: `${color}22` }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {bucket}
      {score !== undefined && <span className="tabular-nums text-slate-700">{score.toFixed(2)}</span>}
    </span>
  );
}

const SOURCE_LABEL: Record<PotholeSource, string> = {
  complaint: "Citizen report",
  sensor: "📡 Sensor only",
  both: "📡 Report + sensor",
};
export function SourceBadge({ source }: { source: PotholeSource }) {
  return <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{SOURCE_LABEL[source]}</span>;
}

export function CrewDot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />;
}
