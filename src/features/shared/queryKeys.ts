import type { QueryClient } from "@tanstack/react-query";
import type { PotholeFilters } from "@/lib/types/models";

/** Constitution 10.3 keys. */
export const keys = {
  potholes: (filters: PotholeFilters) => ["potholes", filters] as const,
  queue: () => ["queue"] as const,
  plan: (crewCount: number | null) => ["plan", crewCount] as const,
  crews: () => ["crews"] as const,
  stats: () => ["stats"] as const,
  config: () => ["config"] as const,
  wards: () => ["wards"] as const,
  pois: () => ["pois"] as const,
};

/** Prefix invalidation: every filter / crew-count variant is refetched. */
export function invalidateOperationalData(client: QueryClient): Promise<unknown> {
  return Promise.all(
    ["potholes", "queue", "plan", "crews", "stats"].map((k) => client.invalidateQueries({ queryKey: [k] })),
  );
}
