"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Lock, AlertCircle, Loader } from "lucide-react";
import { Sidebar, ENTERPRISE_MODULES } from "@/components/Sidebar";
import { AlertFeed } from "@/components/AlertFeed";
import { AIAnalysisDisplay } from "@/components/AIAnalysisDisplay";
import { GlobalThreatRadar } from "@/components/GlobalThreatRadar";
import { RiskMatrix } from "@/components/RiskMatrix";
import { FivetranConnectors } from "@/components/FivetranConnectors";
import { ProjectSettings } from "@/components/ProjectSettings";
import { fetchFdaAlerts, analyzeAlert, deployFivetranConfig } from "@/lib/api";
import { toast } from "sonner";

interface Alert {
  id: string;
  date: string;
  product: string;
  manufacturer: string;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface AIAnalysis {
  riskAnalysis: string;
  alternateManufacturerRecommendation: string;
  fivetranConfigDraft: Record<string, any>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('global-radar');
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<(typeof ENTERPRISE_MODULES)[0] | null>(
    null
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  // Fetch alerts on component mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setAlertsLoading(true);
        const data = await fetchFdaAlerts();
        setAlerts(data);
        setAlertsError(null);
      } catch (error) {
        setAlertsError("Failed to load alerts. Make sure the backend is running on port 8080.");
        console.error("Error loading alerts:", error);
      } finally {
        setAlertsLoading(false);
      }
    };

    loadAlerts();
  }, []);

  // Handle alert selection and AI analysis
  const handleAlertClick = async (alert: Alert) => {
    setSelectedAlert(alert);
    setAiAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(true);

    try {
      const analysis = await analyzeAlert(alert);
      setAiAnalysis(analysis);
    } catch (error) {
      setAnalysisError("Failed to analyze alert. Check backend logs and GEMINI_API_KEY.");
      console.error("Error analyzing alert:", error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleModuleClick = (module: (typeof ENTERPRISE_MODULES)[0]) => {
    setSelectedModule(module);
    setIsRoadmapOpen(true);
  };

  const handleDeploy = async () => {
    if (!aiAnalysis?.fivetranConfigDraft) return;

    setIsDeploying(true);
    try {
      await deployFivetranConfig(aiAnalysis.fivetranConfigDraft);
      toast.success("Deployment Successful");
    } catch (error: any) {
      console.error("Deployment error:", error);
      toast.error(error.message || "Failed to deploy Fivetran connector.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Left Sidebar - Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onModuleClick={handleModuleClick} 
      />

      {/* Center Main Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background/50 relative">
        {activeTab === 'global-radar' && (
          <div className="flex-1 flex flex-col w-full h-full">
            <header className="h-16 border-b border-border bg-card/50 flex items-center px-8 shadow-sm shrink-0">
              <h2 className="text-xl font-semibold tracking-tight">Supply Chain Dashboard</h2>
            </header>
            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              <div className="flex-1 border border-border bg-card/30 rounded-xl overflow-hidden relative flex flex-col">
                <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
                   <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest opacity-70">Global Threat Radar</h3>
                   <div className="flex items-center gap-2">
                     <span className="flex h-2 w-2 rounded-full bg-accent-emerald animate-pulse"></span>
                     <span className="text-xs text-muted-foreground">Live Tracking Active</span>
                   </div>
                </div>
                <div className="flex-1 bg-background relative min-h-0">
                   <GlobalThreatRadar alerts={alerts} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'risk-matrix' && <RiskMatrix />}
        
        {activeTab === 'fivetran' && <FivetranConnectors />}

        {activeTab === 'settings' && <ProjectSettings />}

        {/* Fallback for undeveloped tabs */}
        {!['global-radar', 'risk-matrix', 'fivetran', 'settings'].includes(activeTab) && (
          <div className="flex-1 flex flex-col w-full h-full">
            <header className="h-16 border-b border-border bg-card/50 flex items-center px-8 shadow-sm shrink-0">
              <h2 className="text-xl font-semibold tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
            </header>
            <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
              <p>This view is coming soon or currently under construction.</p>
            </div>
          </div>
        )}
      </main>

      {/* Right Action Panel - AI & Integrations */}
      <aside className="w-96 border-l border-border bg-card flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold tracking-tight">AI Action Panel</h3>
        </div>
        <div className="flex-1 p-6 overflow-auto flex flex-col gap-4">
          {/* Alerts Section */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-widest opacity-70">
              Active Alerts
            </h4>
            {alertsError ? (
              <div className="p-4 rounded-md border border-state-error/30 bg-state-error/10">
                <p className="text-xs text-state-error flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {alertsError}
                </p>
              </div>
            ) : (
              <AlertFeed
                alerts={alerts}
                onAlertClick={handleAlertClick}
                selectedAlertId={selectedAlert?.id}
                isLoading={alertsLoading}
              />
            )}
          </div>

          {/* Analysis Section */}
          {selectedAlert && (
            <div className="border-t border-border/30 pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-widest opacity-70">
                AI Analysis
              </h4>
              {analysisError ? (
                <div className="p-4 rounded-md border border-state-error/30 bg-state-error/10 mb-4">
                  <p className="text-xs text-state-error flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {analysisError}
                  </p>
                </div>
              ) : null}
              <AIAnalysisDisplay
                isLoading={analysisLoading}
                riskAnalysis={aiAnalysis?.riskAnalysis}
                recommendation={aiAnalysis?.alternateManufacturerRecommendation}
                fivetranConfig={aiAnalysis?.fivetranConfigDraft}
              />
              {aiAnalysis && (
                <Button
                  className="w-full mt-6 bg-accent-emerald hover:bg-accent-emerald/90 text-background font-semibold"
                  disabled={analysisLoading || isDeploying}
                  onClick={handleDeploy}
                >
                  {analysisLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : isDeploying ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    "Approve & Deploy"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Enterprise Roadmap Modal Dialog */}
      <Dialog open={isRoadmapOpen} onOpenChange={setIsRoadmapOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-500 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {selectedModule?.name}
            </DialogTitle>
            <DialogDescription>{selectedModule?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-secondary/30 border border-secondary/50 p-4">
              <p className="text-sm text-foreground mb-2 font-semibold">Status: Beta</p>
              <p className="text-sm text-muted-foreground">
                This feature is currently in active development and is scheduled for release as
                part of our Q3 Enterprise Roadmap.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Timeline</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Development: Q2 2026</li>
                <li>Beta Testing: Q3 2026</li>
                <li>General Availability: Q4 2026</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Key Features</p>
              <p className="text-sm text-muted-foreground">
                {selectedModule?.id === "ehr-sync"
                  ? "Secure real-time integration with major EHR systems, maintaining HIPAA compliance with zero-PHI storage."
                  : "Intelligent automation for purchase order generation, optimizing supplier selection and delivery schedules."}
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}