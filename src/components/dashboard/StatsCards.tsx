import { StatCard } from "@/components/ui/Card";
import { SEVERITY_COLORS } from "@/lib/constants";
import type { Stats } from "@/lib/types/models";

export function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatCard label="Open potholes" value={stats.open_total} />
      <StatCard label="Fixed" value={stats.fixed_total} />
      <StatCard label="Critical" value={stats.by_bucket.critical} color={SEVERITY_COLORS.critical} />
      <StatCard label="High" value={stats.by_bucket.high} color={SEVERITY_COLORS.high} />
      <StatCard label="📡 Auto-detected, unreported" value={stats.auto_detected_unreported} hint="Found by sensors, nobody reported" />
    </div>
  );
}
