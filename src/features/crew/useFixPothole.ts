"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { invalidateOperationalData } from "@/features/shared/queryKeys";

export function useFixPothole() {
  const client = useQueryClient();
  return useMutation({
    // crewKey lives only in React state on the crew page; it is sent as the X-Crew-Key header and never stored.
    mutationFn: ({ potholeId, crewId, crewKey }: { potholeId: string; crewId: string; crewKey: string }) =>
      api.fixPothole(potholeId, { crew_id: crewId }, crewKey),
    // Success or ALREADY_FIXED (409): either way the server state changed, so refetch (plan is re-called).
    onSettled: () => invalidateOperationalData(client),
  });
}
