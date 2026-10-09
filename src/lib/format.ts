export const shortId = (id: string): string => id.slice(0, 8);
export const fmt3 = (n: number): string => n.toFixed(3);
export const fmtCoord = (n: number): string => n.toFixed(5);
export const fmtMin = (n: number): string => `${Math.round(n * 10) / 10} min`;
export const fmtSigned = (n: number, suffix = ""): string => `${n > 0 ? "+" : ""}${Math.round(n * 10) / 10}${suffix}`;

export function formatAge(iso: string, nowMs: number): string {
  const minutes = Math.max(0, Math.floor((nowMs - Date.parse(iso)) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}
