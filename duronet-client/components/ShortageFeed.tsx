"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Clock, MapPin } from "lucide-react";

interface DrugShortage {
  id: string;
  drugName: string;
  severity: string;
  affectedRegions: string[];
  shortageReason: string;
  estimatedResolution: string;
}

interface ShortageFeedProps {
  shortages: DrugShortage[];
  isLoading?: boolean;
  error?: string | null;
}

const ShortageFeedSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <Card
        key={i}
        className="p-4 bg-[--bg-surface] border-[--border-default]"
      >
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-slate-700 rounded-full w-16 animate-pulse"></div>
            <div className="h-6 bg-slate-700 rounded-full w-16 animate-pulse"></div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const getSeverityVariant = (
  severity: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "outline";
    default:
      return "secondary";
  }
};

const getSeverityIcon = (severity: string) => {
  if (severity.toLowerCase() === "critical" || severity.toLowerCase() === "high") {
    return <AlertTriangle size={18} className="text-[--state-error]" />;
  }
  return <AlertCircle size={18} className="text-[--state-warning]" />;
};

export const ShortageFeed: React.FC<ShortageFeedProps> = ({
  shortages,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return <ShortageFeedSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-4 bg-[--bg-surface] border-[--border-default]">
        <div className="flex items-center gap-2 text-[--state-error]">
          <AlertTriangle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (!shortages || shortages.length === 0) {
    return (
      <Card className="p-4 bg-[--bg-surface] border-[--border-default] text-center">
        <p className="text-sm text-[--text-muted]">No active shortages</p>
      </Card>
    );
  }

  // Sort by severity: Critical -> High -> Medium -> Low
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedShortages = [...shortages].sort(
    (a, b) =>
      (severityOrder[a.severity.toLowerCase()] ?? 99) -
      (severityOrder[b.severity.toLowerCase()] ?? 99)
  );

  return (
    <div className="space-y-3">
      {sortedShortages.map((shortage) => (
        <Card
          key={shortage.id}
          className="p-4 bg-[--bg-surface] border-[--border-default] hover:border-[--accent-emerald]/50 transition-colors cursor-pointer"
        >
          {/* Title with Severity */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-2 flex-1">
              {getSeverityIcon(shortage.severity)}
              <div className="flex-1">
                <h4 className="font-semibold text-[--text-primary] text-sm">
                  {shortage.drugName}
                </h4>
                <p className="text-xs text-[--text-muted] mt-1">
                  {shortage.shortageReason}
                </p>
              </div>
            </div>
            <Badge variant={getSeverityVariant(shortage.severity)}>
              {shortage.severity}
            </Badge>
          </div>

          {/* Affected Regions */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <MapPin size={14} className="text-[--accent-teal]" />
            <div className="flex flex-wrap gap-1">
              {shortage.affectedRegions.map((region) => (
                <span
                  key={region}
                  className="px-2 py-0.5 rounded-full bg-[--accent-teal]/10 text-[--accent-teal] text-xs"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>

          {/* Resolution Date */}
          <div className="flex items-center gap-2 text-xs text-[--text-muted]">
            <Clock size={14} className="text-[--accent-teal]" />
            <span>Est. Resolution: {shortage.estimatedResolution}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ShortageFeed;
