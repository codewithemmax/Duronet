"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAnalysisDisplayProps {
  isLoading?: boolean;
  riskAnalysis?: string;
  recommendation?: string;
  fivetranConfig?: Record<string, any>;
}

export function AIAnalysisDisplay({
  isLoading,
  riskAnalysis,
  recommendation,
  fivetranConfig,
}: AIAnalysisDisplayProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Risk Analysis Skeleton */}
        <div>
          <div className="h-4 bg-muted/30 rounded w-24 mb-3 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
            <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
            <div className="h-3 bg-muted/20 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>

        {/* Recommendation Skeleton */}
        <div>
          <div className="h-4 bg-muted/30 rounded w-40 mb-3 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted/20 rounded animate-pulse"></div>
            <div className="h-3 bg-muted/20 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>

        {/* Fivetran Config Skeleton */}
        <div>
          <div className="h-4 bg-muted/30 rounded w-32 mb-3 animate-pulse"></div>
          <div className="bg-background/50 rounded-md p-3 h-40 animate-pulse border border-border/20"></div>
        </div>
      </div>
    );
  }

  if (!riskAnalysis) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Select an alert to view AI analysis</p>
      </div>
    );
  }

  const jsonString = JSON.stringify(fivetranConfig, null, 2);

  return (
    <div className="space-y-6">
      {/* Risk Analysis */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent-emerald"></span>
          Risk Analysis
        </h4>
        <div className="bg-secondary/30 rounded-md p-4 border border-border/30">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {riskAnalysis}
          </p>
        </div>
      </div>

      {/* Alternate Manufacturer Recommendation */}
      {recommendation && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-accent-teal"></span>
            Recommended Supplier
          </h4>
          <div className="bg-secondary/30 rounded-md p-4 border border-border/30 border-accent-teal/30">
            <p className="text-sm text-foreground/90">{recommendation}</p>
          </div>
        </div>
      )}

      {/* Fivetran Configuration Draft */}
      {fivetranConfig && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent-emerald"></span>
              Fivetran Config Draft
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(jsonString, 0)}
              className="h-7 px-2 text-xs"
            >
              {copiedIndex === 0 ? (
                <>
                  <Check className="h-3 w-3 mr-1" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </>
              )}
            </Button>
          </div>
          <div className="bg-background/80 rounded-md border border-border/50 overflow-hidden">
            <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto max-h-60 scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-background/20">
              <code>{jsonString}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
