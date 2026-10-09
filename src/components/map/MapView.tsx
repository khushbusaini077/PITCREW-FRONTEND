"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { FALLBACK_CENTER, FALLBACK_ZOOM, boundsOf, crewPosition, localWardPoints, pathToLeaflet, toLeaflet, type Coord } from "@/lib/geo";
import { CREW_COLORS, FIXED_COLOR, SEVERITY_COLORS, crewColor } from "@/lib/constants";
import { fmt3, fmtCoord, shortId } from "@/lib/format";
import type { Crew, PlanRoute, Poi, Pothole, Ward } from "@/lib/types/models";
import { crewIcon, passIcon, poiIcon, stopIcon } from "./icons";
import { OSM_ATTRIBUTION, OSM_TILE_URL } from "./osm";

export interface MapViewProps {
  wards?: Ward[];
  pois?: Poi[];
  potholes?: Pothole[];
  routes?: PlanRoute[];
  crews?: Crew[];
  selectedId?: string | null;
  onSelect?: (potholeId: string) => void;
}

function FitOnce({ points }: { points: Coord[] }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    const b = boundsOf(points);
    if (!b) return;
    map.fitBounds(b, { padding: [30, 30], maxZoom: 16 });
    done.current = true;
  }, [map, points]);
  return null;
}

function Legend() {
  return (
    <div className="absolute bottom-2 left-2 z-[1000] rounded-sm border border-slate-200 bg-white/95 p-2 text-xs text-slate-800">
      <ul className="space-y-1">
        {(Object.keys(SEVERITY_COLORS) as (keyof typeof SEVERITY_COLORS)[]).map((b) => (
          <li key={b} className="flex items-center gap-1.5 capitalize">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[b] }} />
            {b}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: FIXED_COLOR }} />
          Fixed
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-dashed border-slate-900" />
          📡 Sensor-detected
        </li>
        <li className="flex items-center gap-1.5">
          <span className="rw-pass" style={{ position: "static" }}>3</span>
          Vehicle passes
        </li>
        <li>🏫 School · 🏥 Hospital</li>
      </ul>
    </div>
  );
}

export default function MapView({ wards = [], pois = [], potholes = [], routes = [], crews = [], selectedId, onSelect }: MapViewProps) {
  const fitPoints = useMemo<Coord[]>(() => {
    // Prefer where the data actually is; otherwise the local wards (never the whole state).
    const dataPts: Coord[] = [...potholes.filter((p) => p.status === "open"), ...routes.flatMap((r) => r.path)];
    if (dataPts.length > 0) return dataPts;
    return localWardPoints(wards);
  }, [wards, potholes, routes]);

  const open = potholes.filter((p) => p.status === "open");
  const fixed = potholes.filter((p) => p.status === "fixed");

  return (
    <div className="relative h-full w-full">
      <MapContainer center={FALLBACK_CENTER} zoom={FALLBACK_ZOOM} scrollWheelZoom className="h-full w-full rounded-sm">
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
        <FitOnce points={fitPoints} />

        {wards.map((w) => (
          <Polygon key={w.id} positions={w.boundary.map(toLeaflet)} pathOptions={{ color: "#475569", weight: 1.5, dashArray: "6 4", fillOpacity: 0.03 }}>
            <Popup>{w.name}</Popup>
          </Polygon>
        ))}

        {fixed.map((p) => (
          <CircleMarker key={p.id} center={toLeaflet(p)} radius={4} pathOptions={{ color: FIXED_COLOR, fillColor: FIXED_COLOR, fillOpacity: 0.8, weight: 1 }}>
            <Popup>Fixed · {shortId(p.id)}</Popup>
          </CircleMarker>
        ))}

        {routes.map((r) => (
          <Polyline key={`path-${r.crew_id}`} positions={pathToLeaflet(r.path)} pathOptions={{ color: crewColor(r.color_index), weight: 4, opacity: 0.85 }} />
        ))}

        {open.map((p) => {
          const selected = p.id === selectedId;
          return (
            <CircleMarker
              key={p.id}
              center={toLeaflet(p)}
              radius={selected ? 11 : 8}
              pathOptions={{ color: selected ? "#0f172a" : "#ffffff", weight: selected ? 3 : 2, fillColor: SEVERITY_COLORS[p.severity_bucket], fillOpacity: 0.95 }}
              eventHandlers={{ click: () => onSelect?.(p.id) }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold capitalize">
                    {p.severity_bucket} · {fmt3(p.severity)}
                  </p>
                  <p>ID {shortId(p.id)} · {p.source === "complaint" ? "citizen report" : p.source === "sensor" ? "📡 sensor only" : "📡 report + sensor"}</p>
                  <p>
                    {fmtCoord(p.lat)}, {fmtCoord(p.lng)}
                  </p>
                  <p>
                    Vehicle passes: <strong>{p.sensor_event_count}</strong> · citizen reports: <strong>{p.complaint_count}</strong>
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {open
          .filter((p) => p.source !== "complaint")
          .map((p) => (
            <CircleMarker
              key={`ring-${p.id}`}
              center={toLeaflet(p)}
              radius={14}
              interactive={false}
              pathOptions={{ color: "#0f172a", weight: 2, fill: false, dashArray: p.source === "sensor" ? "4 3" : undefined }}
            />
          ))}

        {open
          .filter((p) => p.sensor_event_count > 0)
          .map((p) => (
            <Marker key={`pass-${p.id}`} position={toLeaflet(p)} icon={passIcon(p.sensor_event_count)} interactive={false} keyboard={false} zIndexOffset={300} />
          ))}

        {pois.map((poi) => (
          <Marker key={poi.id} position={toLeaflet(poi)} icon={poiIcon(poi.type)}>
            <Popup>
              {poi.type === "school" ? "School" : "Hospital"}: {poi.name}
            </Popup>
          </Marker>
        ))}

        {routes.flatMap((r) =>
          r.stops.map((s) => (
            <Marker
              key={`${r.crew_id}-${s.sequence}`}
              position={toLeaflet(s)}
              icon={stopIcon(s.sequence, crewColor(r.color_index))}
              zIndexOffset={500}
              eventHandlers={{ click: () => onSelect?.(s.pothole_id) }}
            >
              <Popup>
                {r.crew_name} · stop {s.sequence} · priority {fmt3(s.priority)}
              </Popup>
            </Marker>
          )),
        )}

        {crews.map((c) => (
          <Marker key={c.id} position={toLeaflet(crewPosition(c))} icon={crewIcon(CREW_COLORS[c.color_index] ?? "#475569")} zIndexOffset={800}>
            <Popup>{c.name} (current position)</Popup>
          </Marker>
        ))}
      </MapContainer>
      <Legend />
    </div>
  );
}
