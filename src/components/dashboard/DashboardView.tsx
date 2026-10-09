"use client";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MapView } from "@/components/map/DynamicMap";
import { Card } from "@/components/ui/Card";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import type { Pothole, PotholeSource, PotholeStatus, QueueItem } from "@/lib/types/models";
import { ALL_POTHOLES_FILTER, useConfig, useCrews, usePlan, usePois, usePotholes, useQueue, useStats, useWards } from "@/features/dashboard/queries";
import { configNumber } from "@/features/shared/hooks";
import { invalidateOperationalData } from "@/features/shared/queryKeys";
import { buildAssignments } from "./assignment";
import { ComparisonPanel } from "./ComparisonPanel";
import { CompletedRepairs } from "./CompletedRepairs";
import { CrewPanels } from "./CrewPanels";
import { QueueTable } from "./QueueTable";
import { StatsCards } from "./StatsCards";
import { StatsCharts } from "./StatsCharts";
import { WhyRankDrawer } from "./WhyRankDrawer";

export function DashboardView() {
  const client = useQueryClient();
  const config = useConfig();
  const crews = useCrews();
  const wards = useWards();
  const pois = usePois();
  const potholes = usePotholes(ALL_POTHOLES_FILTER);
  const queue = useQueue();
  const stats = useStats();

  const maxCrews = configNumber(config.data, "MAX_CREWS", 3);
  const [choice, setChoice] = useState<number | null>(null);
  const crewCount = choice ?? (crews.data ? Math.max(1, Math.min(crews.data.length, maxCrews)) : null);
  const plan = usePlan(crewCount);

  const [showFcfs, setShowFcfs] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [whyItem, setWhyItem] = useState<QueueItem | null>(null);
  const [locallyFixed, setLocallyFixed] = useState<Record<string, { pothole: Pothole; fixedAt: string }>>({});
  const locallyFixedIds = useMemo(() => new Set(Object.keys(locallyFixed)), [locallyFixed]);

  // Display filters only: they hide rows, they never change any score or rank.
  const [fWard, setFWard] = useState("");
  const [fStatus, setFStatus] = useState<"" | PotholeStatus>("");
  const [fSource, setFSource] = useState<"" | PotholeSource>("");
  const [fMinSeverity, setFMinSeverity] = useState(0);
  const passes = (p: Pothole): boolean =>
    (fWard === "" || p.ward_id === fWard) && (fStatus === "" || p.status === fStatus) && (fSource === "" || p.source === fSource) && p.severity >= fMinSeverity;
  const mapPotholes = useMemo(
    () => (potholes.data?.items ?? []).filter((p) => !locallyFixedIds.has(p.id) && passes(p)),
    [potholes.data, locallyFixedIds, fWard, fStatus, fSource, fMinSeverity], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const localCompletedPotholes = useMemo(
    () => Object.values(locallyFixed).map(({ pothole, fixedAt }) => ({ ...pothole, status: "fixed" as const, fixed_at: fixedAt })),
    [locallyFixed],
  );
  const completedPotholes = useMemo(() => {
    const byId = new Map((potholes.data?.items ?? []).filter((p) => p.status === "fixed").map((p) => [p.id, p]));
    for (const pothole of localCompletedPotholes) byId.set(pothole.id, pothole);
    return [...byId.values()];
  }, [potholes.data, localCompletedPotholes]);
  const displayedStats = useMemo(() => {
    if (!stats.data) return undefined;
    const completed = Object.values(locallyFixed).map(({ pothole }) => pothole);
    const byBucket = { ...stats.data.by_bucket };
    const bySource = { ...stats.data.by_source };
    for (const pothole of completed) {
      byBucket[pothole.severity_bucket] = Math.max(0, byBucket[pothole.severity_bucket] - 1);
      bySource[pothole.source] = Math.max(0, bySource[pothole.source] - 1);
    }
    return {
      ...stats.data,
      open_total: Math.max(0, stats.data.open_total - completed.length),
      fixed_total: stats.data.fixed_total + completed.length,
      by_bucket: byBucket,
      by_source: bySource,
    };
  }, [stats.data, locallyFixed]);
  const filtersActive = fWard !== "" || fStatus !== "" || fSource !== "" || fMinSeverity > 0;
  const selectCls = "mt-1 w-full border border-slate-300 bg-white px-2 py-1.5 text-sm";

  const rawDisplayed = plan.data ? (showFcfs ? (plan.data.fcfs ?? null) : plan.data.greedy) : null;
  const displayed = useMemo(() => {
    if (!rawDisplayed) return null;
    const fixedLocations = new Set(
      Object.values(locallyFixed).map(({ pothole }) => `${pothole.lat},${pothole.lng}`),
    );
    return {
      ...rawDisplayed,
      unassigned_pothole_ids: rawDisplayed.unassigned_pothole_ids.filter((id) => !locallyFixedIds.has(id)),
      routes: rawDisplayed.routes.map((route) => {
        const completedStops = route.stops.filter((stop) => locallyFixedIds.has(stop.pothole_id));
        const stops = route.stops.filter((stop) => !locallyFixedIds.has(stop.pothole_id));
        const savedMinutes = completedStops.reduce((total, stop) => total + stop.travel_minutes + stop.repair_minutes, 0);
        return {
          ...route,
          stops,
          path: route.path.filter((point) => !fixedLocations.has(`${point.lat},${point.lng}`)),
          total_travel_minutes: Math.max(0, route.total_travel_minutes - completedStops.reduce((total, stop) => total + stop.travel_minutes, 0)),
          total_repair_minutes: Math.max(0, route.total_repair_minutes - completedStops.reduce((total, stop) => total + stop.repair_minutes, 0)),
          shift_used_minutes: Math.max(0, route.shift_used_minutes - savedMinutes),
          shift_remaining_minutes: route.shift_remaining_minutes + savedMinutes,
        };
      }),
    };
  }, [rawDisplayed, locallyFixed, locallyFixedIds]);
  const assignments = useMemo(() => buildAssignments(displayed), [displayed]);
  const crewOptions = Array.from({ length: maxCrews }, (_, i) => ({ value: i + 1, label: `${i + 1} crew${i ? "s" : ""}` }));
  const updated = potholes.dataUpdatedAt ? new Date(potholes.dataUpdatedAt).toLocaleTimeString() : "…";
  const visibleCrews = (crews.data ?? []).filter((c) => displayed?.routes.some((r) => r.crew_id === c.id));
  const markFixed = (item: QueueItem) => {
    setLocallyFixed((current) =>
      current[item.pothole.id]
        ? current
        : { ...current, [item.pothole.id]: { pothole: item.pothole, fixedAt: new Date().toISOString() } },
    );
    setSelectedId((current) => (current === item.pothole.id ? null : current));
    setWhyItem((current) => (current?.pothole.id === item.pothole.id ? null : current));
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <header className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Operations dashboard</h1>
          <p className="text-sm text-slate-600">Live repair queue and crew plan · updated {updated} · refreshes every 10 s</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented label="Number of crews" options={crewOptions} value={crewCount} onChange={setChoice} />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={showFcfs} onChange={(e) => setShowFcfs(e.target.checked)} className="h-4 w-4" />
            Show FCFS routes
          </label>
          <button type="button" onClick={() => void invalidateOperationalData(client)} className="rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-100">
            Refresh
          </button>
        </div>
      </header>

      <QueryBoundary query={stats} skeleton={<Skeleton className="h-24 w-full" />}>
        {(s) => <StatsCards stats={displayedStats ?? s} />}
      </QueryBoundary>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Ward map" className="xl:col-span-2" action={<span className="text-xs text-slate-600">{showFcfs ? "FCFS routes" : "Greedy routes"}</span>}>
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <label className="text-xs font-medium">
              Ward
              <select value={fWard} onChange={(e) => setFWard(e.target.value)} className={selectCls}>
                <option value="">All wards</option>
                {(wards.data ?? []).map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium">
              Status
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value as "" | PotholeStatus)} className={selectCls}>
                <option value="">Open and fixed</option>
                <option value="open">Open</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
            <label className="text-xs font-medium">
              Source
              <select value={fSource} onChange={(e) => setFSource(e.target.value as "" | PotholeSource)} className={selectCls}>
                <option value="">All sources</option>
                <option value="complaint">Citizen report</option>
                <option value="sensor">Sensor</option>
                <option value="both">Report + sensor</option>
              </select>
            </label>
            <label className="text-xs font-medium">
              Min severity: {fMinSeverity.toFixed(1)}
              <input type="range" min={0} max={1} step={0.1} value={fMinSeverity} onChange={(e) => setFMinSeverity(Number(e.target.value))} className="mt-2 w-full" />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                disabled={!filtersActive}
                onClick={() => {
                  setFWard("");
                  setFStatus("");
                  setFSource("");
                  setFMinSeverity(0);
                }}
                className="w-full rounded-sm border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
              >
                Clear filters
              </button>
            </div>
          </div>
          <div className="h-[340px] sm:h-[440px] xl:h-[520px]">
            {potholes.data === undefined && potholes.isError ? (
              <ErrorState error={potholes.error} onRetry={() => void potholes.refetch()} />
            ) : potholes.data === undefined ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <MapView
                wards={wards.data}
                pois={pois.data}
                potholes={mapPotholes}
                routes={displayed?.routes}
                crews={visibleCrews}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
          </div>
          {potholes.data && potholes.data.items.length === 0 && <p className="mt-2 text-sm text-slate-600">No potholes reported yet. The map will fill as reports arrive.</p>}
          {potholes.data && potholes.data.items.length > 0 && mapPotholes.length === 0 && <p className="mt-2 text-sm text-slate-600">No potholes match these filters.</p>}
        </Card>
        <Card title="Crews">
          <QueryBoundary query={plan} skeleton={<Skeleton className="h-48 w-full" />}>
            {(p) =>
              displayed ? (
                <CrewPanels plan={displayed} crews={crews.data ?? []} crewCount={p.greedy.crew_count} label={showFcfs ? "FCFS" : "Greedy"} />
              ) : (
                <EmptyState title="No FCFS plan available">The server returned no FCFS plan for this request.</EmptyState>
              )
            }
          </QueryBoundary>
        </Card>
      </div>

      <Card title="Priority queue">
        <QueryBoundary
          query={queue}
          skeleton={<Skeleton className="h-64 w-full" />}
          isEmpty={(q) => q.items.every((item) => locallyFixedIds.has(item.pothole.id) || !passes(item.pothole))}
          empty={
            filtersActive ? (
              <EmptyState title="No queue items match these filters">Clear the display filters to see the full priority queue.</EmptyState>
            ) : (
              <EmptyState title="The repair queue is empty">No open potholes right now. New reports will appear here automatically.</EmptyState>
            )
          }
        >
          {(q) => (
            <div>
              {localCompletedPotholes.length > 0 && (
                <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  {localCompletedPotholes.length} item{localCompletedPotholes.length === 1 ? "" : "s"} marked fixed for this session only. Reloading restores the server queue.
                </p>
              )}
              <QueueTable
                items={q.items.filter((item) => !locallyFixedIds.has(item.pothole.id) && passes(item.pothole))}
                assignments={assignments}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onWhy={setWhyItem}
                onMarkFixed={markFixed}
              />
            </div>
          )}
        </QueryBoundary>
      </Card>

      <Card title="Completed repairs">
        {potholes.data === undefined ? <Skeleton className="h-32 w-full" /> : <CompletedRepairs potholes={completedPotholes} />}
      </Card>

      <Card title="Greedy vs first-come-first-served">
        <QueryBoundary
          query={plan}
          skeleton={<Skeleton className="h-72 w-full" />}
          isEmpty={(p) => p.comparison === null}
          empty={<EmptyState title="No comparison available">The server did not return comparison metrics for this plan.</EmptyState>}
        >
          {(p) => (p.comparison ? <ComparisonPanel comparison={p.comparison} /> : null)}
        </QueryBoundary>
      </Card>

      <QueryBoundary query={stats} skeleton={<Skeleton className="h-60 w-full" />}>
        {(s) => <StatsCharts stats={displayedStats ?? s} />}
      </QueryBoundary>

      <WhyRankDrawer item={whyItem} assignment={whyItem ? assignments.get(whyItem.pothole.id) : undefined} onClose={() => setWhyItem(null)} />
    </div>
  );
}
