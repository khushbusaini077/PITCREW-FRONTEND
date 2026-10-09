/**
 * The ONLY module allowed to call fetch(). Builds URLs from NEXT_PUBLIC_API_BASE_URL + "/v1/...".
 * Constitution 8.4 / 10.2 / 10.3: 60 s first-request timeout, 20 s afterwards, GET retries
 * (network / 502 / 503 / 504, max 3, backoff 1-2-4 s), POST retried only with an idempotency key,
 * errors surface `error.code`.
 */
import type {
  AppConfig,
  ComplaintCreateResponse,
  ComplaintInput,
  Crew,
  ErrorResponse,
  FixRequest,
  FixResponse,
  PlanRequest,
  PlanResponse,
  Poi,
  PotholeFilters,
  PotholeList,
  QueueResponse,
  Stats,
  Ward,
} from "@/lib/types/models";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, unknown> | null;
  readonly requestId: string | null;

  constructor(code: string, message: string, status: number, details: Record<string, unknown> | null, requestId: string | null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

/** Client-side error codes (never sent by the server). */
export const CLIENT_CODES = { NETWORK: "NETWORK_ERROR", TIMEOUT: "TIMEOUT" } as const;

const FIRST_TIMEOUT_MS = 60_000;
const NEXT_TIMEOUT_MS = 20_000;
const WAKING_DELAY_MS = 4_000;
const BACKOFF_MS = [1_000, 2_000, 4_000];
const RETRYABLE_STATUS = new Set([502, 503, 504]);

export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new ConfigError(
      "NEXT_PUBLIC_API_BASE_URL is not set. Set it to the HTTPS backend URL (no trailing slash, no /v1) in .env.local or the Vercel project settings, then rebuild.",
    );
  }
  if (!/^https?:\/\//.test(raw) || /\/v1\/?$/.test(raw)) {
    throw new ConfigError("NEXT_PUBLIC_API_BASE_URL must start with https:// and must not end with /v1.");
  }
  return raw.replace(/\/+$/, "");
}

/* ---------- connection state (waking banner, API version footer) ---------- */
interface ConnectionState {
  waking: boolean;
  apiVersion: string | null;
}
const SERVER_STATE: ConnectionState = { waking: false, apiVersion: null };
let connection: ConnectionState = SERVER_STATE;
const listeners = new Set<() => void>();
function patchConnection(patch: Partial<ConnectionState>): void {
  connection = { ...connection, ...patch };
  listeners.forEach((l) => l());
}
export const connectionStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: (): ConnectionState => connection,
  getServerSnapshot: (): ConnectionState => SERVER_STATE,
};

/* ---------- core request ---------- */
let firstRequestSettled = false;
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isRetryable(err: ApiError): boolean {
  return err.code === CLIENT_CODES.NETWORK || err.code === CLIENT_CODES.TIMEOUT || RETRYABLE_STATUS.has(err.status);
}

async function attempt<T>(url: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res: Response;
    try {
      res = await fetch(url, { ...init, signal: controller.signal });
    } catch {
      const timedOut = controller.signal.aborted;
      throw new ApiError(
        timedOut ? CLIENT_CODES.TIMEOUT : CLIENT_CODES.NETWORK,
        timedOut ? "The request timed out." : "Could not reach the server.",
        0,
        null,
        null,
      );
    }
    const version = res.headers.get("X-API-Version");
    if (version && version !== connection.apiVersion) patchConnection({ apiVersion: version });

    if (!res.ok) {
      let body: Partial<ErrorResponse> | null = null;
      try {
        body = (await res.json()) as Partial<ErrorResponse>;
      } catch {
        body = null;
      }
      const e = body?.error;
      throw new ApiError(
        e?.code ?? `HTTP_${res.status}`,
        e?.message ?? res.statusText,
        res.status,
        e?.details ?? null,
        e?.request_id ?? res.headers.get("X-Request-ID"),
      );
    }
    if (res.status === 204) return undefined as T;
    try {
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(controller.signal.aborted ? CLIENT_CODES.TIMEOUT : CLIENT_CODES.NETWORK, "Invalid server response.", res.status, null, null);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, init: RequestInit, retry: boolean): Promise<T> {
  const url = `${getBaseUrl()}/v1${path}`;
  const isFirst = !firstRequestSettled;
  const timeoutMs = isFirst ? FIRST_TIMEOUT_MS : NEXT_TIMEOUT_MS;
  const wakingTimer = isFirst ? setTimeout(() => patchConnection({ waking: true }), WAKING_DELAY_MS) : null;
  try {
    for (let n = 0; ; n++) {
      try {
        return await attempt<T>(url, init, timeoutMs);
      } catch (err) {
        if (err instanceof ApiError && retry && n < BACKOFF_MS.length && isRetryable(err)) {
          await sleep(BACKOFF_MS[n] ?? 4_000);
          continue;
        }
        throw err;
      }
    }
  } finally {
    if (isFirst) {
      firstRequestSettled = true;
      if (wakingTimer) clearTimeout(wakingTimer);
      patchConnection({ waking: false });
    }
  }
}

function query(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

const get = <T>(path: string): Promise<T> => request<T>(path, { method: "GET", headers: { Accept: "application/json" } }, true);

const postJson = <T>(path: string, body: unknown, idempotent: boolean, extraHeaders: Record<string, string> = {}): Promise<T> =>
  request<T>(
    path,
    { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json", ...extraHeaders }, body: JSON.stringify(body) },
    idempotent,
  );

/* ---------- endpoints ---------- */
export const api = {
  getConfig: () => get<AppConfig>("/config"),
  getWards: () => get<Ward[]>("/wards"),
  getPois: () => get<Poi[]>("/pois"),
  getCrews: () => get<Crew[]>("/crews"),
  getPotholes: (f: PotholeFilters = {}) => get<PotholeList>(`/potholes${query({ ...f })}`),
  getQueue: (params: { ward_id?: string; limit?: number } = {}) => get<QueueResponse>(`/queue${query(params)}`),
  getStats: () => get<Stats>("/stats"),

  /** Never persists and never mutates crews, but has no idempotency key, so it is not auto-retried. */
  createPlan: (body: PlanRequest) => postJson<PlanResponse>("/plan", body, false),
  /** The crew key goes ONLY in the X-Crew-Key header (never in a URL, never stored). */
  fixPothole: (potholeId: string, body: FixRequest, crewKey: string) =>
    postJson<FixResponse>(`/potholes/${encodeURIComponent(potholeId)}/fix`, body, false, { "X-Crew-Key": crewKey }),

  /** Retried on network/502/503/504 because client_request_id makes it idempotent (8.4). */
  submitComplaint(input: ComplaintInput): Promise<ComplaintCreateResponse> {
    const form = new FormData();
    form.set("client_request_id", input.clientRequestId);
    form.set("text", input.text);
    form.set("lat", input.lat.toFixed(6));
    form.set("lng", input.lng.toFixed(6));
    if (input.gpsAccuracyM !== null && Number.isFinite(input.gpsAccuracyM)) {
      form.set("gps_accuracy_m", String(Math.round(Math.min(5000, Math.max(0, input.gpsAccuracyM)) * 10) / 10));
    }
    if (input.roadClass !== null) form.set("road_class", input.roadClass);
    if (input.photo) form.set("photo", input.photo);
    return request<ComplaintCreateResponse>("/complaints", { method: "POST", headers: { Accept: "application/json" }, body: form }, true);
  },
};
