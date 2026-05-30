"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Package } from "lucide-react";

interface InventoryItem {
  currentStock: number;
  dailyBurnRate: number;
  daysOfSupply: number;
}

interface HospitalTelemetry {
  hospitalId: string;
  name: string;
  region: string;
  inventory: Record<string, InventoryItem>;
  bedCapacity: string;
}

interface InventoryMatrixProps {
  telemetry: HospitalTelemetry[];
  isLoading?: boolean;
  error?: string | null;
}

const getSeverityColor = (daysOfSupply: number): string => {
  if (daysOfSupply <= 3) return "var(--state-error)";
  if (daysOfSupply <= 7) return "var(--state-warning)";
  return "var(--state-success)";
};

const getSeverityBadge = (daysOfSupply: number): "default" | "secondary" | "destructive" | "outline" => {
  if (daysOfSupply <= 3) return "destructive";
  if (daysOfSupply <= 7) return "outline";
  return "secondary";
};

const InventoryMatrixSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card
        key={i}
        className="p-4 bg-[--bg-surface] border-[--border-default]"
      >
        <div className="space-y-4">
          {/* Hospital header skeleton */}
          <div className="h-6 bg-slate-700 rounded w-1/3 animate-pulse"></div>
          
          {/* Inventory items skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="grid grid-cols-4 gap-4 py-2 border-t border-[--border-default]">
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const InventoryMatrix: React.FC<InventoryMatrixProps> = ({
  telemetry,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return <InventoryMatrixSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6 bg-[--bg-surface] border-[--border-default]">
        <div className="flex items-center gap-3 text-[--state-error]">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold">Unable to Load Inventory</p>
            <p className="text-sm text-[--text-muted]">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!telemetry || telemetry.length === 0) {
    return (
      <Card className="p-6 bg-[--bg-surface] border-[--border-default] text-center">
        <Package className="mx-auto mb-2 text-[--text-muted]" size={32} />
        <p className="text-[--text-muted]">No inventory data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {telemetry.map((hospital) => (
        <Card
          key={hospital.hospitalId}
          className="overflow-hidden bg-[--bg-surface] border-[--border-default]"
        >
          {/* Hospital Header */}
          <div className="border-b border-[--border-default] p-4 bg-gradient-to-r from-[--bg-surface] to-[--bg-base]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[--text-primary] text-lg">
                  {hospital.name}
                </h3>
                <p className="text-sm text-[--text-muted]">
                  {hospital.region} • Bed Capacity: {hospital.bedCapacity}
                </p>
              </div>
              <Badge variant="outline" className="bg-[--accent-teal]/10 text-[--accent-teal] border-[--accent-teal]/30">
                {hospital.hospitalId}
              </Badge>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="p-0">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 p-4 bg-[--bg-base] border-b border-[--border-default] text-xs font-semibold text-[--text-muted] uppercase tracking-wider">
              <div>Drug</div>
              <div className="text-right">Current Stock</div>
              <div className="text-right">Daily Burn Rate</div>
              <div className="text-right">Days of Supply</div>
              <div className="text-right">Status</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[--border-default]">
              {Object.entries(hospital.inventory).map(([drugName, item]) => (
                <div
                  key={drugName}
                  className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-[--bg-base]/50 transition-colors"
                >
                  <div className="text-sm font-medium text-[--text-primary]">
                    {drugName}
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-[--text-primary]">
                      {item.currentStock.toLocaleString()}
                    </div>
                    <div className="text-xs text-[--text-muted]">units</div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TrendingDown size={16} className="text-[--state-warning]" />
                      <span className="text-sm font-semibold text-[--text-primary]">
                        {item.dailyBurnRate}
                      </span>
                    </div>
                    <div className="text-xs text-[--text-muted]">units/day</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-[--text-primary]">
                      {item.daysOfSupply.toFixed(1)}
                    </div>
                    <div className="text-xs text-[--text-muted]">days</div>
                  </div>

                  <div className="text-right">
                    <Badge variant={getSeverityBadge(item.daysOfSupply)}>
                      {item.daysOfSupply <= 3
                        ? "Critical"
                        : item.daysOfSupply <= 7
                        ? "Warning"
                        : "Healthy"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InventoryMatrix;
