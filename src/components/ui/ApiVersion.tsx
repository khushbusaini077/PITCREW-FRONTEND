"use client";
import { useConnection } from "@/features/shared/hooks";

export function ApiVersion() {
  const { apiVersion } = useConnection();
  return <span>API {apiVersion ? `v${apiVersion}` : "not yet contacted"}</span>;
}
