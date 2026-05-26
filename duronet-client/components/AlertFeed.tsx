"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, AlertOctagon } from "lucide-react";

interface Alert {
  id: string;
  date: string;
  product: string;
  manufacturer: string;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedHospitals?: any[];
}

interface AlertFeedProps {
  alerts: Alert[];
  onAlertClick: (alert: Alert) => void;
  selectedAlertId?: string;
  isLoading?: boolean;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertOctagon,
    badge: "destructive",
  },
  high: {
    icon: AlertTriangle,
    badge: "secondary",
  },
  medium: {
    icon: AlertCircle,
    badge: "outline",
  },
  low: {
    icon: AlertCircle,
    badge: "outline",
  },
};

export function AlertFeed({
  alerts,
  onAlertClick,
  selectedAlertId,
  isLoading,
}: AlertFeedProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with pulsing indicator */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
          FDA Threat Stream
        </h2>
      </div>

      {/* Scrollable list of alerts */}
      <div className="overflow-y-auto h-[600px] pr-2 space-y-3 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 bg-secondary/30 rounded-md border border-border/30 animate-pulse"
              >
                <div className="h-4 bg-muted/30 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : !alerts || alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active threats detected</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
            const isSelected = selectedAlertId === alert.id;

            // Compute mock timestamp
            const mockTime = new Date(alert.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Mock Region
            const region = alert.affectedHospitals?.length 
              ? `${alert.affectedHospitals.length} Regions Affected` 
              : "National";

            return (
              <button
                key={alert.id}
                onClick={() => onAlertClick(alert)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-accent ring-1 ring-primary"
                    : "border-border hover:bg-accent bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={config.badge as any} className="uppercase text-[10px] font-bold tracking-wider">
                      {alert.severity}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {alert.date} {mockTime}
                  </span>
                </div>
                
                <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
                  {alert.product}
                </h3>
                
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="truncate pr-2">MFR: {alert.manufacturer}</span>
                    <span className="whitespace-nowrap">{region}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
