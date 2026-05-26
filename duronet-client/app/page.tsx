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
import { Lock, AlertCircle, Loader, Globe, Grid, Bell, Database, Server, Terminal, Settings } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);

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
      setAnalysisError("Failed to analyze alert.");
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
    setDeploymentId(null);
    try {
      const response = await deployFivetranConfig(aiAnalysis.fivetranConfigDraft);
      if (response && response.connectorId) {
        setDeploymentId(response.connectorId);
      }
      toast.success("Deployment Successful");
    } catch (error: any) {
      console.error("Deployment error:", error);
      toast.error(error.message || "Failed to deploy Fivetran connector.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-y-auto md:overflow-hidden bg-background text-foreground">
      {/* Mobile Top Header */}
      <header className="flex md:hidden h-16 border-b border-border bg-card shrink-0 items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/duronet-icon.svg" alt="DuroNet Icon" className="h-6 w-6" />
          <h1 className="text-xl font-bold text-primary tracking-tight">DuroNet</h1>
        </div>
        <button 
          className="p-2 border border-border rounded-md bg-secondary/50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="absolute top-16 left-0 w-full bg-slate-900 border-b border-border z-50 flex flex-col p-4 shadow-xl">
          <div className="space-y-2 mb-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">Core</div>
            <button 
              className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
              onClick={() => { setActiveTab('global-radar'); setIsMobileMenuOpen(false); }}
            >
              <Globe className="h-4 w-4 opacity-70" /> Global Radar
            </button>
            <button 
              className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
              onClick={() => { setActiveTab('risk-matrix'); setIsMobileMenuOpen(false); }}
            >
              <Grid className="h-4 w-4 opacity-70" /> Risk Matrix
            </button>
            <button 
              className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
              onClick={() => { setActiveTab('alerts'); setIsMobileMenuOpen(false); }}
            >
              <Bell className="h-4 w-4 opacity-70" /> Alert Feed
            </button>
          </div>
          
          <div className="space-y-2 mb-4 border-t border-border/50 pt-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">Data Pipelines</div>
            <button 
              className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
              onClick={() => { setActiveTab('fivetran'); setIsMobileMenuOpen(false); }}
            >
              <Database className="h-4 w-4 opacity-70" /> Fivetran Connectors
            </button>
            <button 
              className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
              onClick={() => { setActiveTab('suppliers'); setIsMobileMenuOpen(false); }}
            >
              <Server className="h-4 w-4 opacity-70" /> Supplier Database
            </button>
            <button 
              className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
              onClick={() => { setActiveTab('logs'); setIsMobileMenuOpen(false); }}
            >
              <Terminal className="h-4 w-4 opacity-70" /> AI Logs
            </button>
          </div>

          <div className="space-y-2 mb-4 border-t border-border/50 pt-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">Enterprise Modules</div>
            {ENTERPRISE_MODULES.map((module) => {
              const IconComponent = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => { handleModuleClick(module); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 opacity-70" />
                    <span>{module.name}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5 flex-shrink-0">
                    Beta
                  </Badge>
                </button>
              );
            })}
          </div>

          <div className="space-y-2 mb-4 border-t border-border/50 pt-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">Configuration</div>
            <button 
              className="w-full flex items-center gap-3 px-3 py-3 text-foreground hover:bg-secondary/50 rounded-md transition-colors text-sm font-medium"
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
            >
              <Settings className="h-4 w-4 opacity-70" /> Project Settings
            </button>
          </div>
        </nav>
      )}

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
      <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col shadow-xl z-10 shrink-0">
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
                <div className="mt-6 flex flex-col gap-4">
                  <Button
                    className="w-full bg-accent-emerald hover:bg-accent-emerald/90 text-background font-semibold min-h-[44px]"
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
                  
                  {deploymentId && (
                    <div className="p-4 rounded-md border border-accent-emerald bg-accent-emerald/10">
                      <p className="text-sm font-semibold text-accent-emerald mb-1">
                        ✅ Live Data Pipeline Provisioned
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-2">
                        Fivetran Connector ID: <span className="font-bold text-foreground">{deploymentId}</span>
                      </p>
                    </div>
                  )}
                </div>
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