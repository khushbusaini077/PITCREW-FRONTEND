/**
 * TEMPORARY STAND-IN for the generated file.
 *
 * contracts/openapi.yaml was NOT supplied to the frontend build, so exact types cannot be
 * generated yet. This file mirrors CONSTITUTION.md sections 5 and 8 verbatim (field names,
 * enums, nullability) and uses the openapi-typescript layout (components["schemas"][...]).
 *
 * REPLACE IT: run `npm run gen:types` (needs ../contracts/openapi.yaml). Only
 * src/lib/types/models.ts imports from this file, so schema-name differences are fixed there.
 */
export interface components {
  schemas: {
    LatLng: { lat: number; lng: number };
    Ward: {
      id: string;
      name: string;
      center_lat: number;
      center_lng: number;
      boundary: components["schemas"]["LatLng"][];
    };
    POI: {
      id: string;
      type: "school" | "hospital";
      name: string;
      lat: number;
      lng: number;
      ward_id: string | null;
    };
    Crew: {
      id: string;
      name: string;
      color_index: number;
      depot_lat: number;
      depot_lng: number;
      shift_minutes: number;
      current_lat: number;
      current_lng: number;
      minutes_used: number;
      updated_at: string;
    };
    Pothole: {
      id: string;
      lat: number;
      lng: number;
      ward_id: string | null;
      road_class: "main" | "secondary" | "lane";
      source: "complaint" | "sensor" | "both";
      severity: number;
      severity_bucket: "low" | "medium" | "high" | "critical";
      severity_reasons: string[];
      exposure: number;
      exposure_reasons: string[];
      complaint_count: number;
      sensor_event_count: number;
      confirmation_count: number;
      repair_minutes: number;
      status: "open" | "fixed";
      photo_urls: string[];
      first_reported_at: string;
      last_reported_at: string;
      fixed_at: string | null;
      updated_at: string;
    };
    Complaint: {
      id: string;
      client_request_id: string;
      pothole_id: string;
      text: string;
      photo_url: string | null;
      lat: number;
      lng: number;
      road_class: "main" | "secondary" | "lane" | null;
      text_score: number | null;
      photo_score: number | null;
      created_at: string;
    };
    PotholeList: { items: components["schemas"]["Pothole"][]; total: number };
    QueueItem: {
      rank: number;
      pothole: components["schemas"]["Pothole"];
      severity: number;
      exposure: number;
      proximity: number;
      aging_multiplier: number;
      priority: number;
      nearest_crew_id: string;
    };
    QueueResponse: { generated_at: string; items: components["schemas"]["QueueItem"][] };
    PlanStop: {
      sequence: number;
      pothole_id: string;
      lat: number;
      lng: number;
      travel_minutes: number;
      repair_minutes: number;
      arrive_at_minute: number;
      finish_at_minute: number;
      severity: number;
      exposure: number;
      proximity: number;
      aging_multiplier: number;
      priority: number;
    };
    PlanRoute: {
      crew_id: string;
      crew_name: string;
      color_index: number;
      stops: components["schemas"]["PlanStop"][];
      path: components["schemas"]["LatLng"][];
      total_travel_minutes: number;
      total_repair_minutes: number;
      shift_used_minutes: number;
      shift_remaining_minutes: number;
    };
    Plan: {
      algorithm: "greedy" | "fcfs";
      generated_at: string;
      crew_count: number;
      routes: components["schemas"]["PlanRoute"][];
      unassigned_pothole_ids: string[];
    };
    PlanMetrics: {
      fixed_total: number;
      fixed_high_severity: number;
      high_severity_total: number;
      fixed_school_zone_high_severity: number;
      school_zone_high_severity_total: number;
      severity_weighted_coverage: number;
      total_travel_minutes: number;
      avg_wait_high_severity_minutes: number;
    };
    Improvement: {
      fixed_high_severity_delta: number;
      fixed_school_zone_high_severity_delta: number;
      coverage_delta_points: number;
      travel_reduction_pct: number;
      avg_wait_reduction_pct: number;
    };
    Comparison: {
      crew_count: number;
      greedy: components["schemas"]["PlanMetrics"];
      fcfs: components["schemas"]["PlanMetrics"];
      improvement: components["schemas"]["Improvement"];
    };
    PlanRequest: { crew_count?: number; include_fcfs?: boolean };
    PlanResponse: {
      greedy: components["schemas"]["Plan"];
      fcfs: components["schemas"]["Plan"] | null;
      comparison: components["schemas"]["Comparison"] | null;
    };
    FixRequest: { crew_id: string };
    FixResponse: { pothole: components["schemas"]["Pothole"]; crew: components["schemas"]["Crew"] };
    ComplaintCreateResponse: {
      complaint: components["schemas"]["Complaint"];
      pothole: components["schemas"]["Pothole"];
      is_new_pothole: boolean;
      queue_rank: number;
      queue_size: number;
    };
    Stats: {
      open_total: number;
      fixed_total: number;
      by_bucket: { low: number; medium: number; high: number; critical: number };
      by_source: { complaint: number; sensor: number; both: number };
      auto_detected_unreported: number;
    };
    /** Exact shape of GET /v1/config is not defined in the Constitution: read defensively. */
    AppConfig: { [key: string]: unknown };
    ErrorResponse: {
      error: { code: string; message: string; details?: { [key: string]: unknown } | null; request_id?: string };
    };
  };
}
