"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import { fetchInventoryPrediction, InventoryPredictionResponse } from "@/lib/api";

interface HospitalMarker {
  id: string;
  name: string;
  type: "hub" | "hospital";
  coordinates: [number, number];
  daysOfSupply: number;
  inTransit: boolean;
  region: string;
  supplyStatus: string;
}

const HOSPITAL_COORDINATES: Record<string, [number, number]> = {
  'HOSP-001': [40.76, -73.95],
  'HOSP-002': [40.65, -73.78],
  'HOSP-003': [40.71, -73.99],
};

const HUB_MARKER: HospitalMarker = {
  id: "north-ridge-hub",
  name: "North Ridge Supply Hub",
  type: "hub",
  coordinates: [40.74, -73.97],
  daysOfSupply: 18,
  inTransit: false,
  region: "Northeast Hub",
  supplyStatus: "Surplus",
};

function getMarkerColor(marker: HospitalMarker) {
  if (marker.inTransit) {
    return "#f59e0b"; // amber
  }

  return marker.daysOfSupply > 5 ? "#10b981" : "#ef4444"; // green or red
}

function getMarkerBorder(marker: HospitalMarker) {
  if (marker.type === "hub") {
    return "#14b8a6";
  }

  return marker.daysOfSupply > 5 ? "#22c55e" : marker.inTransit ? "#f59e0b" : "#f43f5e";
}

export default function GlobalRadarMap() {
  const [prediction, setPrediction] = useState<InventoryPredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrediction = async () => {
      try {
        setLoading(true);
        const response = await fetchInventoryPrediction('Albuterol Sulfate');
        setPrediction(response);
        setError(null);
      } catch (error) {
        console.error('Failed to load inventory prediction:', error);
        setError('Unable to load predictive demand data.');
      } finally {
        setLoading(false);
      }
    };

    loadPrediction();
  }, []);

  const markers = useMemo(() => {
    const hospitalMarkers: HospitalMarker[] = prediction?.predictions.map((item) => ({
      id: item.hospitalId,
      name: item.name,
      type: 'hospital',
      coordinates: HOSPITAL_COORDINATES[item.hospitalId] ?? [40.72, -73.94],
      daysOfSupply: item.daysOfSupplyRemaining ?? 0,
      inTransit: item.hospitalId === 'HOSP-003',
      region: item.region,
      supplyStatus:
        item.status === 'CRITICAL_SHORTAGE_IMMINENT'
          ? 'Imminent Shortage'
          : 'Safe',
    })) ?? [];

    return [HUB_MARKER, ...hospitalMarkers].map((marker) => ({
      ...marker,
      color: getMarkerColor(marker),
      borderColor: getMarkerBorder(marker),
    }));
  }, [prediction]);

  const center: [number, number] = [40.76, -73.95];

  return (
    <div className="rounded-3xl border border-border bg-slate-950/80 p-4 shadow-xl">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Predictive Control Tower
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              Regional Hospital Inventory Health
            </h3>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Dark Mode Network View
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground max-w-2xl">
            Map markers reflect current Albuterol demand math. Red markers mean fewer than 5 days of supply, amber means emergency transfer in transit, and green means inventory is above threshold.
          </p>
          {error ? (
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">
              {error}
            </span>
          ) : loading ? (
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs text-secondary">Updating live predictions…</span>
          ) : (
            <span className="rounded-full bg-emerald-500/10 px-3 py-0.4 text-xs text-emerald-200">
              Live
            </span>
          )}
        </div>
      </div>

      <div className="h-[420px] overflow-hidden rounded-3xl border border-border bg-slate-950">
        <MapContainer
          center={center}
          zoom={10}
          scrollWheelZoom
          className="h-full w-full"
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://carto.com/attributions">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {markers.map((marker) => (
            <CircleMarker
              key={marker.id}
              center={marker.coordinates}
              radius={marker.type === 'hub' ? 11 : 8}
              pathOptions={{
                color: marker.borderColor,
                fillColor: marker.color,
                fillOpacity: 0.92,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-xs text-left text-white">
                  <p className="font-semibold">{marker.name}</p>
                  <p>{marker.region}</p>
                  <p>{marker.supplyStatus}</p>
                  <p>{marker.inTransit ? 'Transfer active' : `${marker.daysOfSupply.toFixed(1)} days supply`}</p>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm text-slate-100">
                  <strong>{marker.name}</strong>
                  <p className="text-xs text-slate-400">{marker.region}</p>
                  <div className="mt-2 space-y-1 text-[13px]">
                    <p>
                      <span className="font-semibold">Status:</span> {marker.supplyStatus}
                    </p>
                    <p>
                      <span className="font-semibold">Available days:</span> {marker.daysOfSupply.toFixed(1)}
                    </p>
                    {marker.inTransit && <p className="font-semibold text-amber-300">Emergency transfer in progress</p>}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
