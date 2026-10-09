"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ComplaintInput } from "@/lib/types/models";
import { invalidateOperationalData } from "@/features/shared/queryKeys";

export function useSubmitComplaint() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ComplaintInput) => api.submitComplaint(input),
    onSuccess: () => invalidateOperationalData(client),
  });
}
