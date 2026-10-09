"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getBaseUrl } from "@/lib/api/client";
import { invalidateOperationalData } from "@/features/shared/queryKeys";

function useRealtimeInvalidation(client: QueryClient): void {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !anonKey) return; // 10 s polling remains the fallback
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void import("@supabase/supabase-js").then(({ createClient }) => {
      if (cancelled) return;
      const sb = createClient(url, anonKey);
      let timer: ReturnType<typeof setTimeout> | undefined;
      // Realtime events are only a hint to refetch (never the source of truth).
      const hint = () => {
        clearTimeout(timer);
        timer = setTimeout(() => void invalidateOperationalData(client), 400);
      };
      const channel = sb
        .channel("roadwise-ops")
        .on("postgres_changes", { event: "*", schema: "public", table: "potholes" }, hint)
        .on("postgres_changes", { event: "*", schema: "public", table: "crews" }, hint)
        .subscribe();
      cleanup = () => {
        clearTimeout(timer);
        void sb.removeChannel(channel);
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [client]);
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 5_000 } } }));
  useRealtimeInvalidation(client);
  const configError = useMemo(() => {
    try {
      getBaseUrl();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }, []);

  if (configError) {
    return (
      <div role="alert" className="mx-auto my-16 max-w-xl rounded-sm border border-red-300 bg-red-50 p-6 text-red-900">
        <h1 className="text-lg font-semibold">Frontend is not configured</h1>
        <p className="mt-2 text-sm">{configError}</p>
      </div>
    );
  }
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
