"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { REFETCH_INTERVAL_MS } from "@/lib/constants";
import type { PotholeFilters } from "@/lib/types/models";
import { keys } from "@/features/shared/queryKeys";

export const useConfig = () => useQuery({ queryKey: keys.config(), queryFn: api.getConfig, staleTime: 5 * 60_000 });
export const useWards = () => useQuery({ queryKey: keys.wards(), queryFn: api.getWards, staleTime: 5 * 60_000 });
export const usePois = () => useQuery({ queryKey: keys.pois(), queryFn: api.getPois, staleTime: 5 * 60_000 });

export const usePotholes = (filters: PotholeFilters) =>
  useQuery({ queryKey: keys.potholes(filters), queryFn: () => api.getPotholes(filters), refetchInterval: REFETCH_INTERVAL_MS });
export const useQueue = () =>
  useQuery({ queryKey: keys.queue(), queryFn: () => api.getQueue({ limit: 500 }), refetchInterval: REFETCH_INTERVAL_MS });
export const useStats = () =>
  useQuery({ queryKey: keys.stats(), queryFn: api.getStats, refetchInterval: REFETCH_INTERVAL_MS });
export const useCrews = () =>
  useQuery({ queryKey: keys.crews(), queryFn: api.getCrews, refetchInterval: REFETCH_INTERVAL_MS });

/** include_fcfs is always true so one query serves greedy routes, FCFS routes and the comparison. */
export const usePlan = (crewCount: number | null) =>
  useQuery({
    queryKey: keys.plan(crewCount),
    queryFn: () => api.createPlan({ crew_count: crewCount ?? undefined, include_fcfs: true }),
    enabled: crewCount !== null,
    refetchInterval: REFETCH_INTERVAL_MS,
  });

/** Dashboard shows open + fixed (fixed in grey); 500 is the API maximum. */
export const ALL_POTHOLES_FILTER: PotholeFilters = { limit: 500 };
