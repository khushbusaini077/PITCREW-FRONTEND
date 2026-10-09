import type { components } from "./api";

type S = components["schemas"];

export type Ward = S["Ward"];
export type Poi = S["POI"];
export type Crew = S["Crew"];
export type Pothole = S["Pothole"];
export type PotholeList = S["PotholeList"];
export type QueueItem = S["QueueItem"];
export type QueueResponse = S["QueueResponse"];
export type PlanStop = S["PlanStop"];
export type PlanRoute = S["PlanRoute"];
export type Plan = S["Plan"];
export type PlanMetrics = S["PlanMetrics"];
export type Comparison = S["Comparison"];
export type PlanRequest = S["PlanRequest"];
export type PlanResponse = S["PlanResponse"];
export type FixRequest = S["FixRequest"];
export type FixResponse = S["FixResponse"];
export type ComplaintCreateResponse = S["ComplaintCreateResponse"];
export type Stats = S["Stats"];
export type AppConfig = S["AppConfig"];
export type ErrorResponse = S["ErrorResponse"];

export type SeverityBucket = Pothole["severity_bucket"];
export type PotholeSource = Pothole["source"];
export type PotholeStatus = Pothole["status"];
export type RoadClass = Pothole["road_class"];

export interface PotholeFilters {
  ward_id?: string;
  status?: PotholeStatus;
  source?: PotholeSource;
  min_severity?: number;
  limit?: number;
  offset?: number;
}

export interface ComplaintInput {
  clientRequestId: string;
  text: string;
  lat: number;
  lng: number;
  /** From the browser Geolocation API (coords.accuracy, metres); null when the point was picked by hand. */
  gpsAccuracyM: number | null;
  /** null = "Not sure": the field is omitted from the request. */
  roadClass: RoadClass | null;
  photo: File | null;
}
