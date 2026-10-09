"use client";
import { useConnection, useOnline } from "@/features/shared/hooks";

export function StatusBanners() {
  const online = useOnline();
  const { waking } = useConnection();
  return (
    <>
      {!online && (
        <div role="alert" className="bg-slate-900 px-4 py-2 text-center text-sm text-white">
          You are offline. Data shown may be out of date, and submissions are paused until you reconnect.
        </div>
      )}
      {online && waking && (
        <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          Waking up the server, this can take up to a minute…
        </div>
      )}
    </>
  );
}
