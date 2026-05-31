"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertFeed } from "@/components/AlertFeed";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

interface Alert {
  id: string;
  date: string;
  product: string;
  manufacturer: string;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface SurplusData {
  hub: string;
  totalStock: number;
  committed: number;
  available: number;
  requested: number;
  isFeasible: boolean;
}

interface AIAnalysis {
  riskAnalysis: string;
  alternateManufacturerRecommendation: string;
  surplusData: SurplusData;
  fivetranConfigDraft: Record<string, any>;
  fivetranPayload: {
    service: string;
    config: {
      schema: string;
      table: string;
      sheet_id: string;
      named_range: string;
    };
  };
}

interface AIActionPanelProps {
  alerts: Alert[];
  selectedAlertId?: string | null;
  selectedAlert?: Alert | null;
  onAlertClick: (alert: Alert) => void;
  alertsLoading: boolean;
  alertsError: string | null;
  analysisLoading: boolean;
  analysisError: string | null;
  aiAnalysis: AIAnalysis | null;
  onDeploy: () => void;
  isDeploying: boolean;
  deploymentStage: 'idle' | 'inTransit' | 'received';
  deploymentId: string | null;
  deploymentEta: string | null;
  onConfirmReceipt: () => void;
}

const STAKEHOLDERS = [
  {
    id: "pharmacy-director",
    name: "Pharmacy Director",
    role: "Clinical Approval",
  },
  {
    id: "supply-chain-manager",
    name: "Supply Chain Manager",
    role: "Logistics Oversight",
  },
];

export function AIActionPanel({
  alerts,
  selectedAlertId,
  selectedAlert,
  onAlertClick,
  alertsLoading,
  alertsError,
  analysisLoading,
  analysisError,
  aiAnalysis,
  onDeploy,
  isDeploying,
  deploymentStage,
  deploymentId,
  deploymentEta,
  onConfirmReceipt,
}: AIActionPanelProps) {
  const [notifiedStakeholders, setNotifiedStakeholders] = useState<Record<string, boolean>>({
    "pharmacy-director": false,
    "supply-chain-manager": false,
  });

  const hasAllNotifications = useMemo(
    () => STAKEHOLDERS.every((stakeholder) => notifiedStakeholders[stakeholder.id]),
    [notifiedStakeholders]
  );

  const showTransitTracker = deploymentStage !== 'idle';
  const stageOneComplete = showTransitTracker;
  const stageTwoComplete = showTransitTracker;
  const stageThreeActive = deploymentStage === 'inTransit' || deploymentStage === 'received';
  const stageFourComplete = deploymentStage === 'received';

  const handleNotify = (id: string) => {
    setNotifiedStakeholders((current) => ({ ...current, [id]: true }));
  };

  return (
    <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col shadow-xl z-10 shrink-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              AI Action Panel
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Emergency Transfer Governance
            </h3>
          </div>
          <Badge variant="secondary" className="uppercase tracking-[0.18em] text-[10px]">
            Emerald Watch
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Prescriptive Authority
              </p>
              <h4 className="text-sm font-semibold text-foreground">
                Active Alerts
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
              Live
            </Badge>
          </div>

          {alertsError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{alertsError}</span>
              </div>
            </div>
          ) : (
            <AlertFeed
              alerts={alerts}
              onAlertClick={onAlertClick}
              selectedAlertId={selectedAlertId ?? undefined}
              isLoading={alertsLoading}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Surplus Breakdown
              </p>
              <h4 className="text-sm font-semibold text-foreground">
                Supply Hub Availability
              </h4>
            </div>
            {aiAnalysis?.surplusData && (
              <Badge
                variant="secondary"
                className={`${
                  aiAnalysis.surplusData.isFeasible ? 'bg-emerald-600 text-background' : 'bg-destructive text-background'
                }`}
              >
                {aiAnalysis.surplusData.isFeasible ? 'Feasible' : 'Review Required'}
              </Badge>
            )}
          </div>

          {analysisLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((index) => (
                <div key={index} className="h-20 rounded-2xl bg-slate-900/70" />
              ))}
            </div>
          ) : !selectedAlert ? (
            <div className="rounded-2xl border border-border/60 bg-background/50 p-5 text-sm text-muted-foreground">
              Select an FDA alert to unlock the AI action workflow.
            </div>
          ) : analysisError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{analysisError}</span>
              </div>
            </div>
          ) : aiAnalysis ? (
            <div className="rounded-3xl border border-accent-emerald/20 bg-slate-950/80 p-5 shadow-lg shadow-accent-teal/5">
              <div className="mb-4 text-sm text-muted-foreground">
                {aiAnalysis.surplusData.hub} hub summary for emergency transfer planning.
              </div>

              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/70 bg-background/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Total Stock
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-foreground">
                    {aiAnalysis.surplusData.totalStock.toLocaleString()}
                  </dd>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Committed
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-foreground">
                    {aiAnalysis.surplusData.committed.toLocaleString()}
                  </dd>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Truly Available
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-foreground">
                    {aiAnalysis.surplusData.available.toLocaleString()}
                  </dd>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/10 p-4">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Requested Units
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-foreground">
                    {aiAnalysis.surplusData.requested.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-2xl border border-border/70 bg-accent-teal/5 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent-emerald" />
                  <span>
                    {aiAnalysis.surplusData.isFeasible
                      ? 'Transfer request is within available stock.'
                      : 'Requested units exceed available stock. Review required.'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-background/50 p-5 text-sm text-muted-foreground">
              Waiting for AI analysis results.
            </div>
          )}
        </div>

        {showTransitTracker ? (
          <div className="rounded-3xl border border-border/60 bg-background/30 p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Physical Transit Tracker
                </p>
                <h4 className="text-sm font-semibold text-foreground">
                  Emergency Inventory State Machine
                </h4>
              </div>
              <Badge
                variant="secondary"
                className={deploymentStage === 'received' ? 'bg-emerald-600 text-background' : 'bg-amber-500 text-background'}
              >
                {deploymentStage === 'received' ? 'Safe' : 'In Transit'}
              </Badge>
            </div>

            <div className="grid gap-3">
              <div className={`rounded-2xl border p-4 ${stageOneComplete ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-border bg-background/80'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">1. Pipeline Deployed</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-emerald-400">Complete</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Your Fivetran connector is created and the data pipeline is now provisioned.
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${stageTwoComplete ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-border bg-background/80'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">2. Transfer Authorized</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-emerald-400">Complete</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Stakeholder approval is accepted and the handoff is authorized for physical dispatch.
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${stageThreeActive ? 'border-amber-400/30 bg-amber-400/10' : 'border-border bg-background/80'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">3. In Transit</p>
                  <span className={`text-xs uppercase tracking-[0.2em] ${stageFourComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {stageFourComplete ? 'Complete' : 'Active'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Inventory is currently moving through the emergency logistics chain toward the receiving dock.
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${stageFourComplete ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-border bg-background/80'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">4. Physically Received</p>
                  <span className={`text-xs uppercase tracking-[0.2em] ${stageFourComplete ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    {stageFourComplete ? 'Complete' : 'Pending'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Confirm receipt at the hospital dock to finalize the safe inventory transfer.
                </p>
              </div>
            </div>

            {deploymentEta && (
              <div className="rounded-2xl border border-border/70 bg-slate-950/80 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Estimated Arrival</p>
                <p className="mt-1">{deploymentEta}</p>
              </div>
            )}

            {deploymentId && (
              <div className="rounded-2xl border border-border/70 bg-slate-950/80 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Fivetran Connector</p>
                <p className="mt-1 break-all">{deploymentId}</p>
              </div>
            )}

            {deploymentStage === 'inTransit' && (
              <Button
                className="w-full bg-amber-500 hover:bg-amber-500/90 text-background font-semibold min-h-[44px]"
                onClick={onConfirmReceipt}
              >
                Confirm Physical Dock Receipt
              </Button>
            )}

            {deploymentStage === 'received' && (
              <div className="rounded-2xl border border-emerald-600/40 bg-emerald-600/10 p-4 text-sm text-emerald-100">
                <p className="font-semibold">Final State: Safe</p>
                <p className="mt-1 text-muted-foreground">
                  Physical receipt verified. Hospital inventory marker is now safe.
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Governance Checklist
                  </p>
                  <h4 className="text-sm font-semibold text-foreground">
                    Multi-Stakeholder Approval
                  </h4>
                </div>
                <Badge variant="secondary" className="uppercase tracking-[0.18em] text-[10px]">
                  Required
                </Badge>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/30 p-5 space-y-4">
                {STAKEHOLDERS.map((stakeholder) => {
                  const hasNotified = notifiedStakeholders[stakeholder.id];

                  return (
                    <div
                      key={stakeholder.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-slate-950/80 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{stakeholder.name}</p>
                          <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={hasNotified ? "secondary" : "default"}
                          className={hasNotified ? "bg-accent-emerald text-background" : "bg-background text-foreground border border-border"}
                          onClick={() => handleNotify(stakeholder.id)}
                          disabled={hasNotified}
                        >
                          {hasNotified ? "Notified ✓" : "Notify"}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {hasNotified
                          ? "Confirmation acknowledged. Ready for final approval."
                          : "Send a simulated notification to enable the deployment gateway."}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-border/60 bg-slate-950/80 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="h-5 w-5 text-accent-teal" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Action Execution Gateway</p>
                    <p className="text-xs text-muted-foreground">
                      Notifications must be completed before emergency deployment can be authorized.
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-accent-emerald hover:bg-accent-emerald/90 text-background font-semibold min-h-[44px]"
                  disabled={!hasAllNotifications || analysisLoading || !aiAnalysis || isDeploying}
                  onClick={onDeploy}
                >
                  {isDeploying ? "Preparing Deployment..." : "Approve & Deploy Emergency Transfer"}
                </Button>

                <p className="mt-3 text-xs text-muted-foreground">
                  The button stays disabled until both stakeholders are notified.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
