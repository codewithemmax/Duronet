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
import useSupercluster from "use-supercluster";

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

  // Extract all hospitals as individual points for clustering
  const hospitalPoints = useMemo(() => {
    const points: any[] = [];
    markers.forEach(alert => {
      alert.affectedHospitals?.forEach(hosp => {
        points.push({
          type: "Feature",
          properties: {
            cluster: false,
            hospitalId: `${alert.id}-${hosp.name}`,
            name: hosp.name,
            fdaId: alert.id,
            product: alert.product,
            severity: alert.severity,
          },
          geometry: {
            type: "Point",
            coordinates: hosp.coordinates
          }
        });
      });
    });
    return points;
  }, [markers]);

  // Implement supercluster
  const { clusters, supercluster } = useSupercluster({
    points: hospitalPoints,
    bounds: [-180, -90, 180, 90], // Global bounds
    zoom: Math.round(position.zoom * 2),
    options: { radius: 40, maxZoom: 20 }
  });

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

          {/* Render Hospital Clusters and Individual Markers */}
          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const {
              cluster: isCluster,
              point_count: pointCount,
            } = cluster.properties;

            const foSize = 400; // Safe bounding box for HTML overlays

            if (isCluster) {
              const size = 32; // base size on screen
              return (
                <Marker key={`cluster-${cluster.id}`} coordinates={[longitude, latitude]}>
                  <foreignObject 
                    x={-foSize / 2 / position.zoom} 
                    y={-foSize / 2 / position.zoom} 
                    width={foSize / position.zoom} 
                    height={foSize / position.zoom}
                    style={{ overflow: 'visible' }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div
                        className="flex items-center justify-center rounded-full font-bold shadow-lg cursor-pointer transition-transform hover:scale-110"
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          color: "var(--accent-emerald)",
                          border: "2px solid var(--accent-emerald)",
                          width: `${size / position.zoom}px`,
                          height: `${size / position.zoom}px`,
                          fontSize: `${14 / position.zoom}px`,
                        }}
                        onClick={() => {
                          const expansionZoom = supercluster ? supercluster.getClusterExpansionZoom(cluster.id as number) : 1;
                          setPosition({
                            coordinates: [longitude, latitude],
                            zoom: Math.max(position.zoom * 1.5, expansionZoom / 2),
                          });
                        }}
                      >
                        {pointCount}
                      </div>
                    </div>
                  </foreignObject>
                </Marker>
              );
            }

            // Individual hospital marker
            const dotSize = 8;
            return (
              <Marker key={`hospital-${cluster.properties.hospitalId}`} coordinates={[longitude, latitude]}>
                <foreignObject 
                  x={-foSize / 2 / position.zoom} 
                  y={-foSize / 2 / position.zoom} 
                  width={foSize / position.zoom} 
                  height={foSize / position.zoom}
                  style={{ overflow: 'visible' }}
                >
                  <div className="relative w-full h-full flex items-center justify-center group cursor-pointer">
                    {/* The Marker Dot */}
                    <div 
                      className="rounded-full shadow-md transition-transform group-hover:scale-125" 
                      style={{ 
                        backgroundColor: "var(--accent-emerald)",
                        width: `${dotSize / position.zoom}px`, 
                        height: `${dotSize / position.zoom}px` 
                      }} 
                    />
                    
                    {/* The Tooltip/Popup */}
                    <div 
                      className="absolute bottom-1/2 mb-1 hidden group-hover:block"
                      style={{ 
                        transform: `scale(${1 / position.zoom})`,
                        transformOrigin: 'bottom center',
                        pointerEvents: 'none'
                      }}
                    >
                      <div className="w-56 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider">{cluster.properties.fdaId}</span>
                        <span className="font-bold text-sm text-slate-100 leading-tight">{cluster.properties.name}</span>
                        <span className="text-xs text-slate-300 leading-tight line-clamp-2">{cluster.properties.product}</span>
                        <div className="flex items-center mt-1">
                           <span className="text-[10px] text-slate-500 mr-1 uppercase font-semibold">Severity:</span>
                           <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                            cluster.properties.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            cluster.properties.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            cluster.properties.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                           }`}>
                             {cluster.properties.severity}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </Marker>
            );
          })}

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
              <circle r={4 / Math.max(1, position.zoom / 2)} fill="var(--accent-emerald)" />
              
              {/* The pulsing ring using Framer Motion */}
              <motion.circle
                r={12 / Math.max(1, position.zoom / 2)}
                fill="transparent"
                stroke="var(--accent-teal)"
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


