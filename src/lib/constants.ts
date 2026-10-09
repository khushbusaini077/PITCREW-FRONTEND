import type { SeverityBucket } from "./types/models";

export const SEVERITY_COLORS: Record<SeverityBucket, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};
export const SEVERITY_ORDER: SeverityBucket[] = ["critical", "high", "medium", "low"];

export const CREW_COLORS = ["#2563eb", "#7c3aed", "#0d9488"] as const;
export const crewColor = (colorIndex: number): string => CREW_COLORS[colorIndex] ?? "#475569";

export const FIXED_COLOR = "#9ca3af";

/** Constitution 10.3: 10 s fallback refetch interval. */
export const REFETCH_INTERVAL_MS = 10_000;
