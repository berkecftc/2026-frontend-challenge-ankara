import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Record } from "../types";
import { resolveCoordinates } from "../utils/geocoding";

interface Props {
  records: Record[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Kaynak tipi → marker renk eşlemesi */
const SOURCE_COLORS: { [key: string]: string } = {
  checkin: "#3b82f6",
  message: "#a855f7",
  sighting: "#f59e0b",
  note: "#64748b",
  tip: "#ef4444",
};

interface MapRecord {
  record: Record;
  lat: number;
  lng: number;
}

/**
 * Konum bilgisi olan kayıtları Leaflet haritası üzerinde gösterir.
 * Kaynak tipine göre renkli dairesel marker'lar, popup bilgileri ve
 * seçili kaydı vurgulama desteği içerir.
 */
export function MapView({ records, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());

  const mapRecords = useMemo<MapRecord[]>(() => {
    const result: MapRecord[] = [];
    for (const r of records) {
      const coords = resolveCoordinates(r.location);
      if (coords) {
        result.push({ record: r, lat: coords.lat, lng: coords.lng });
      }
    }
    return result;
  }, [records]);

  const resolvedCount = mapRecords.length;
  const unresolved = records.filter((r) => r.location && !resolveCoordinates(r.location)).length;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.9334, 32.8597],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const marker of markersRef.current.values()) {
      marker.remove();
    }
    markersRef.current.clear();

    for (const mr of mapRecords) {
      const color = SOURCE_COLORS[mr.record.sourceType] ?? "#64748b";
      const isSelected = mr.record.id === selectedId;

      const marker = L.circleMarker([mr.lat, mr.lng], {
        radius: isSelected ? 10 : 7,
        fillColor: color,
        color: isSelected ? "#ffffff" : color,
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: isSelected ? 1 : 0.75,
      }).addTo(map);

      const popupContent = buildPopupContent(mr.record);
      marker.bindPopup(popupContent, {
        className: "map-popup",
        maxWidth: 260,
      });

      marker.on("click", () => onSelect(mr.record.id));

      markersRef.current.set(mr.record.id, marker);
    }

    if (mapRecords.length > 0) {
      const group = L.featureGroup(Array.from(markersRef.current.values()));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [mapRecords, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const marker = markersRef.current.get(selectedId);
    if (marker) {
      const latlng = marker.getLatLng();
      map.flyTo(latlng, 14, { duration: 0.5 });
      marker.openPopup();
    }
  }, [selectedId]);

  return (
    <div className="map-view">
      <header className="map-view__header">
        <div>
          <h2>Map View</h2>
          <p className="muted">
            {resolvedCount} located · {unresolved > 0 && `${unresolved} unresolved`}
          </p>
        </div>
        <div className="map-view__legend">
          {Object.entries(SOURCE_COLORS).map(([type, color]) => (
            <span key={type} className="map-view__legend-item">
              <span
                className="map-view__legend-dot"
                style={{ background: color }}
              />
              {type}
            </span>
          ))}
        </div>
      </header>
      <div ref={containerRef} className="map-view__container" />
    </div>
  );
}

function buildPopupContent(r: Record): string {
  const parts: string[] = [];
  parts.push(`<strong>${r.sourceType.toUpperCase()}</strong>`);
  if (r.person) parts.push(`👤 ${escapeHtml(r.person)}`);
  if (r.relatedPerson) parts.push(`↔ ${escapeHtml(r.relatedPerson)}`);
  if (r.location) parts.push(`📍 ${escapeHtml(r.location)}`);
  if (r.content) {
    const snippet = r.content.length > 100 ? r.content.slice(0, 97) + "…" : r.content;
    parts.push(`<em>${escapeHtml(snippet)}</em>`);
  }
  return parts.join("<br>");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
