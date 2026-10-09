"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { connectionStore } from "@/lib/api/client";
import type { AppConfig } from "@/lib/types/models";

const subscribeOnline = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};
export const useOnline = (): boolean =>
  useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);

export const useConnection = () =>
  useSyncExternalStore(connectionStore.subscribe, connectionStore.getSnapshot, connectionStore.getServerSnapshot);

export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** Reads a numeric constant from GET /v1/config (flat or nested under "constants"/"config"). */
export function configNumber(config: AppConfig | undefined, key: string, fallback: number): number {
  if (!config) return fallback;
  const candidates: unknown[] = [config[key], (config.constants as AppConfig | undefined)?.[key], (config.config as AppConfig | undefined)?.[key]];
  for (const c of candidates) if (typeof c === "number" && Number.isFinite(c)) return c;
  return fallback;
}
