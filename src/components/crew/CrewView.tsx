"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MapView } from "@/components/map/DynamicMap";
import { SeverityBadge } from "@/components/ui/Badges";
import { Card } from "@/components/ui/Card";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ApiError } from "@/lib/api/client";
import { describeError } from "@/lib/api/errorMessages";
import { crewColor } from "@/lib/constants";
import { fmt3, fmtCoord, fmtMin, shortId } from "@/lib/format";
import type { Crew } from "@/lib/types/models";
import { ALL_POTHOLES_FILTER, useConfig, useCrews, usePlan, usePois, usePotholes, useWards } from "@/features/dashboard/queries";
import { useFixPothole } from "@/features/crew/useFixPothole";
import { configNumber, useOnline } from "@/features/shared/hooks";

function resolveCrewCount(requested: number, crews: Crew[], crewId: string, maxCrews: number): number {
  const sorted = [...crews].sort((a, b) => a.id.localeCompare(b.id));
  const needed = sorted.findIndex((c) => c.id === crewId) + 1; // plan uses the first N crews by id
  const base = Number.isInteger(requested) && requested >= 1 ? requested : crews.length;
  return Math.max(1, Math.min(maxCrews, Math.max(base, needed)));
}

export function CrewView({ crewId }: { crewId: string }) {
  const online = useOnline();
  const search = useSearchParams();
  const config = useConfig();
  const crews = useCrews();
  const wards = useWards();
  const pois = usePois();
  const potholes = usePotholes(ALL_POTHOLES_FILTER);
  const fix = useFixPothole();
  // Crew key: React state only (lost on reload by design). Never put it in storage, cookies or a URL.
  const [crewKey, setCrewKey] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const markDone = (potholeId: string) => {
    setConfirmId(null);
    fix.mutate(
      { potholeId, crewId, crewKey },
      {
        onError: (err) => {
          // 401 / 403: ask for the key again
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) setCrewKey("");
        },
      },
    );
  };

  const maxCrews = configNumber(config.data, "MAX_CREWS", 3);
  const crewCount = crews.data ? resolveCrewCount(Number(search.get("crews")), crews.data, crewId, maxCrews) : null;
  const plan = usePlan(crewCount);

  const crew = crews.data?.find((c) => c.id === crewId);
  const route = plan.data?.greedy.routes.find((r) => r.crew_id === crewId);
  const byId = useMemo(() => new Map((potholes.data?.items ?? []).map((p) => [p.id, p])), [potholes.data]);
  const routePotholes = useMemo(() => (route ? route.stops.map((s) => byId.get(s.pothole_id)).filter((p) => p !== undefined) : []), [route, byId]);
  const color = crewColor(route?.color_index ?? crew?.color_index ?? 0);

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-4 px-3 py-4 sm:px-5 sm:py-6">
      <Link href="/dashboard" className="text-sm font-semibold text-white hover:underline">
        ← Back to dashboard
      </Link>

      <QueryBoundary query={crews} skeleton={<Skeleton className="h-28 w-full" />}>
        {(list) =>
          !list.some((c) => c.id === crewId) ? (
            <EmptyState title="Crew not found">There is no crew with id “{crewId}”. Open it from the dashboard instead.</EmptyState>
          ) : (
            <header className="rounded-sm bg-white p-4 shadow-lg" style={{ borderLeftColor: color, borderLeftWidth: 6 }}>
              <h1 className="text-2xl font-semibold tracking-tight">{crew?.name}</h1>
              <dl className="mt-2 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div>
                  <dt className="text-slate-600">Shift length</dt>
                  <dd className="font-medium">{crew ? fmtMin(crew.shift_minutes) : "…"}</dd>
                </div>
                <div>
                  <dt className="text-slate-600">Already worked</dt>
                  <dd className="font-medium">{crew ? fmtMin(crew.minutes_used) : "…"}</dd>
                </div>
                <div>
                  <dt className="text-slate-600">Planned today</dt>
                  <dd className="font-medium">{route ? `${route.stops.length} stops · ${fmtMin(route.shift_used_minutes)}` : "…"}</dd>
                </div>
                <div>
                  <dt className="text-slate-600">Time remaining</dt>
                  <dd className="font-medium">{route ? fmtMin(route.shift_remaining_minutes) : "…"}</dd>
                </div>
              </dl>
            </header>
          )
        }
      </QueryBoundary>

      {fix.isError && (
        <div role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {describeError(fix.error)}
        </div>
      )}

      {crewKey === "" && (
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (keyDraft.trim() !== "") {
              setCrewKey(keyDraft.trim());
              setKeyDraft("");
              fix.reset();
            }
          }}
          className="rounded-sm bg-white p-4 shadow-lg"
        >
          <label htmlFor="crew-key" className="text-lg font-semibold">
            Crew key
          </label>
          <p className="text-sm text-slate-600">Enter the key your supervisor gave this crew. It is kept in memory only and is forgotten when you reload the page.</p>
          <input
            id="crew-key"
            type="password"
            autoComplete="off"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 text-base"
          />
          <button type="submit" disabled={keyDraft.trim() === ""} className="mt-3 rounded-sm btn-grad px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            Unlock crew view
          </button>
        </form>
      )}

      <div className={`grid gap-4 lg:grid-cols-2 ${crewKey === "" ? "hidden" : ""}`}>
        <Card title="Ordered repair stops">
          <QueryBoundary
            query={plan}
            skeleton={<Skeleton className="h-64 w-full" />}
            isEmpty={() => !route || route.stops.length === 0}
            empty={<EmptyState title="No stops assigned">This crew has nothing to repair in the current plan. It updates automatically when new reports arrive.</EmptyState>}
          >
            {() => (
              <ol className="space-y-3">
                {route?.stops.map((s) => {
                  const p = byId.get(s.pothole_id);
                  const done = p?.status === "fixed";
                  return (
                    <li key={s.pothole_id} className="rounded-sm border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }}>
                            {s.sequence}
                          </span>
                          <span className="font-mono text-xs">{shortId(s.pothole_id)}</span>
                          {p && <SeverityBadge bucket={p.severity_bucket} score={s.severity} />}
                        </div>
                        <span className="text-xs font-medium">{done ? "Fixed" : "Open"}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">
                        Priority <strong className="tabular-nums">{fmt3(s.priority)}</strong> · {fmtCoord(s.lat)}, {fmtCoord(s.lng)}
                        {p?.ward_id ? ` · ${p.ward_id}` : ""}
                      </p>
                      <p className="text-sm text-slate-600">
                        Travel {fmtMin(s.travel_minutes)} · repair {s.repair_minutes} min · arrive at minute {Math.round(s.arrive_at_minute)}
                      </p>
                      {p && p.severity_reasons.length > 0 && <p className="mt-1 text-xs text-slate-600">{p.severity_reasons.join(", ")}</p>}
                      {confirmId === s.pothole_id ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">Mark this repair as done?</span>
                          <button type="button" onClick={() => markDone(s.pothole_id)} className="rounded-sm btn-grad px-3 py-1.5 text-sm font-medium text-white">
                            Yes, done
                          </button>
                          <button type="button" onClick={() => setConfirmId(null)} className="rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!online || done || fix.isPending || crewKey === ""}
                          onClick={() => setConfirmId(s.pothole_id)}
                          className="mt-3 rounded-sm btn-grad px-3 py-1.5 text-sm font-medium text-white  disabled:opacity-50"
                        >
                          {fix.isPending && fix.variables?.potholeId === s.pothole_id ? "Saving…" : "Mark done"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </QueryBoundary>
          {plan.isError && plan.data !== undefined && <ErrorState error={plan.error} onRetry={() => void plan.refetch()} />}
        </Card>

        <Card title="Route map">
          <div className="h-[340px] sm:h-[420px] lg:h-[460px]">
            {wards.isPending || potholes.isPending ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <MapView wards={wards.data} pois={pois.data} potholes={routePotholes} routes={route ? [route] : []} crews={crew ? [crew] : []} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
