"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, Polygon, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { FALLBACK_CENTER, FALLBACK_ZOOM, boundsOf, centroid, fromLeaflet, localWardPoints, toLeaflet, type Coord } from "@/lib/geo";
import type { Ward } from "@/lib/types/models";
import { OSM_ATTRIBUTION, OSM_TILE_URL } from "./osm";

function ClickToPick({ onPick }: { onPick: (c: Coord) => void }) {
  useMapEvents({ click: (e) => onPick(fromLeaflet(e.latlng)) });
  return null;
}

function Follow({ value, wardPoints }: { value: Coord | null; wardPoints: Coord[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || value) return;
    const b = boundsOf(wardPoints);
    if (b) {
      map.fitBounds(b, { padding: [20, 20] });
      fitted.current = true;
    }
  }, [map, value, wardPoints]);
  useEffect(() => {
    if (!value) return;
    const target = toLeaflet(value);
    if (!map.getBounds().contains(target)) map.setView(target, Math.max(map.getZoom(), 15));
  }, [map, value]);
  return null;
}

export interface LocationPickerProps {
  value: Coord | null;
  onChange: (c: Coord) => void;
  wards: Ward[];
}

export default function LocationPicker({ value, onChange, wards }: LocationPickerProps) {
  const wardPoints = useMemo(() => localWardPoints(wards), [wards]);
  const initial = value ?? centroid(wardPoints);
  return (
    <MapContainer
      center={initial ? toLeaflet(initial) : FALLBACK_CENTER}
      zoom={initial ? 14 : FALLBACK_ZOOM}
      scrollWheelZoom={false}
      className="h-full w-full rounded-sm"
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} maxZoom={19} />
      {wards.map((w) => (
        <Polygon key={w.id} positions={w.boundary.map(toLeaflet)} pathOptions={{ color: "#475569", weight: 1.5, dashArray: "6 4", fillOpacity: 0.03 }} />
      ))}
      <ClickToPick onPick={onChange} />
      <Follow value={value} wardPoints={wardPoints} />
      {value && <CircleMarker center={toLeaflet(value)} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }} />}
    </MapContainer>
  );
}
