import L from "leaflet";
import type { Poi } from "@/lib/types/models";

export const stopIcon = (n: number, color: string): L.DivIcon =>
  L.divIcon({ className: "rw-divicon", html: `<div class="rw-stop" style="background:${color}">${n}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] });

/** Small count badge above-right of a pothole marker: number of recorded vehicle (sensor) passes. */
export const passIcon = (count: number): L.DivIcon =>
  L.divIcon({
    className: "rw-divicon",
    html: `<div class="rw-pass" title="${count} vehicle pass${count === 1 ? "" : "es"}">${count > 99 ? "99+" : count}</div>`,
    iconSize: [22, 22],
    iconAnchor: [-4, 26],
  });

export const crewIcon = (color: string): L.DivIcon =>
  L.divIcon({ className: "rw-divicon", html: `<div class="rw-crew" style="border-color:${color}">🚧</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });

export const poiIcon = (type: Poi["type"]): L.DivIcon =>
  L.divIcon({ className: "rw-divicon", html: `<div class="rw-poi">${type === "school" ? "🏫" : "🏥"}</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
