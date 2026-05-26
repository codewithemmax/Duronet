"use client";

import React, { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// A common free TopoJSON file for world maps
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface Hospital {
  name: string;
  coordinates: [number, number];
}

interface Alert {
  id: string;
  date: string;
  product: string;
  manufacturer: string;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedHospitals?: Hospital[];
}

interface GlobalThreatRadarProps {
  alerts: Alert[];
}

export function GlobalThreatRadar({ alerts }: GlobalThreatRadarProps) {
  // State for map zooming and panning
  const [position, setPosition] = useState({ coordinates: [0, 20] as [number, number], zoom: 1 });

  // Mock coordinates for the alerts to plot them on the map
  const markers = useMemo(() => {
    return alerts.map((alert) => {
      let coordinates: [number, number] = [0, 0];
      
      // Assign rough coordinates based on manufacturer for visual demonstration
      if (alert.manufacturer.includes("Mylan")) {
        coordinates = [-80.18, 40.26]; // Canonsburg, PA
      } else if (alert.manufacturer.includes("Hospira")) {
        coordinates = [-87.84, 42.25]; // Lake Forest, IL
      } else if (alert.manufacturer.includes("Actavis")) {
        coordinates = [-74.41, 40.85]; // Parsippany, NJ
      } else {
        // Fallback random coordinate in the US if unknown
        coordinates = [-95 + Math.random() * 20, 35 + Math.random() * 10];
      }

      return {
        ...alert,
        coordinates
      };
    });
  }, [alerts]);

  const handleResetView = () => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  };

  const handleThreatClick = (coordinates: [number, number]) => {
    setPosition({ coordinates, zoom: 4 });
  };

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Reset View Button */}
      {position.zoom > 1 && (
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleResetView}
            className="shadow-md bg-secondary/80 hover:bg-secondary text-xs"
          >
            Reset View
          </Button>
        </div>
      )}

      <ComposableMap
        projectionConfig={{
          scale: 140,
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={(newPosition) => setPosition({ coordinates: newPosition.coordinates, zoom: newPosition.zoom })}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--bg-surface)"
                  stroke="var(--border-default)"
                  strokeWidth={0.5 / position.zoom} // Keep strokes thin while zooming
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "var(--border-default)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Render Hospital Markers if zoomed in */}
          {position.zoom >= 3 && markers.map((marker) => 
            marker.affectedHospitals?.map((hospital, index) => (
              <Marker key={`${marker.id}-hosp-${index}`} coordinates={hospital.coordinates}>
                <circle r={2 / position.zoom} fill="hsl(var(--primary))" />
                <text
                  textAnchor="middle"
                  y={-4 / position.zoom}
                  style={{ 
                    fontFamily: "var(--font-sans)", 
                    fontSize: `${5 / position.zoom}px`,
                    fill: "var(--text-muted)",
                    pointerEvents: "none"
                  }}
                >
                  {hospital.name}
                </text>
              </Marker>
            ))
          )}

          {/* Render Main Threat Markers */}
          {markers.map((marker) => (
            <Marker 
              key={marker.id} 
              coordinates={marker.coordinates}
              onClick={() => handleThreatClick(marker.coordinates)}
              style={{
                default: { outline: "none", cursor: "pointer" },
                hover: { outline: "none", cursor: "pointer" },
                pressed: { outline: "none", cursor: "pointer" }
              }}
            >
              {/* The base dot */}
              <circle r={4 / Math.max(1, position.zoom / 2)} fill="var(--state-error)" />
              
              {/* The pulsing ring using Framer Motion */}
              <motion.circle
                r={12 / Math.max(1, position.zoom / 2)}
                fill="transparent"
                stroke="var(--state-error)"
                strokeWidth={2 / position.zoom}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
