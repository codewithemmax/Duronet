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
import { Lock, AlertCircle, Loader, Globe, Grid, Bell, Database, Server, Terminal, Settings, Package } from "lucide-react";
import { Sidebar, ENTERPRISE_MODULES } from "@/components/Sidebar";
import dynamic from "next/dynamic";
import { AlertFeed, GlobalThreatRadar, ProjectSettings } from "@/components/Placeholders";
import { AIActionPanel } from "@/components/AIActionPanel";
import { AISearchBar } from "@/components/AISearchBar";
import { InventoryForecast } from "@/components/InventoryForecast";
import { TransferPipelines } from "@/components/TransferPipelines";
import { AILogs } from "@/components/AILogs";
import { InventoryMatrix } from "@/components/InventoryMatrix";
import { ShortageFeed } from "@/components/ShortageFeed";
import { fetchFdaAlerts, analyzeAlert, deployFivetranConfig, fetchInventoryStatus, fetchInventoryPrediction, InventoryPredictionResponse } from "@/lib/api";
import { toast } from "sonner";

const GlobalRadarMap = dynamic(
  () => import("@/components/GlobalRadarMap"),
  { ssr: false }
);

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

interface HospitalTelemetry {
  hospitalId: string;
  name: string;
  region: string;
  inventory: Record<string, any>;
  bedCapacity: string;
}

interface DrugShortage {
  id: string;
  drugName: string;
  severity: string;
  affectedRegions: string[];
  shortageReason: string;
  estimatedResolution: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('inventory-dashboard');
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<(typeof ENTERPRISE_MODULES)[0] | null>(
    null
  );
  
  // Alerts state
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedShortageId, setSelectedShortageId] = useState<string | null>(null);
  
  // Inventory state
  const [inventoryTelemetry, setInventoryTelemetry] = useState<HospitalTelemetry[]>([]);
  const [drugShortages, setDrugShortages] = useState<DrugShortage[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryPrediction, setInventoryPrediction] = useState<InventoryPredictionResponse | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  
  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [deploymentStage, setDeploymentStage] = useState<'idle' | 'inTransit' | 'received'>('idle');
  const [deploymentEta, setDeploymentEta] = useState<string | null>(null);
  const [safeAlertIds, setSafeAlertIds] = useState<string[]>([]);

  // Fetch alerts and inventory on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load alerts
        setAlertsLoading(true);
        const alertsData = await fetchFdaAlerts();
        setAlerts(alertsData);
        setAlertsError(null);
      } catch (error) {
        setAlertsError("Failed to load alerts.");
        console.error("Error loading alerts:", error);
      } finally {
        setAlertsLoading(false);
      }

      try {
        // Load inventory
        setInventoryLoading(true);
        const inventoryData = await fetchInventoryStatus();
        setInventoryTelemetry(inventoryData.telemetry || []);
        setDrugShortages(inventoryData.shortages || []);
        setInventoryError(null);
      } catch (error) {
        setInventoryError("Failed to load inventory data. Make sure the backend is running on port 8080.");
        console.error("Error loading inventory:", error);
      } finally {
        setInventoryLoading(false);
      }

      try {
        setPredictionLoading(true);
        const predictionData = await fetchInventoryPrediction('Albuterol Sulfate');
        setInventoryPrediction(predictionData);
        setPredictionError(null);
      } catch (error) {
        setPredictionError("Failed to load inventory predictions. Ensure the prediction endpoint is available.");
        console.error("Error loading inventory prediction:", error);
      } finally {
        setPredictionLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle alert selection and AI analysis
  const handleAlertClick = async (alert: Alert) => {
    setSelectedAlert(alert);
    setAiAnalysis(null);
    setAnalysisError(null);
    setDeploymentStage('idle');
    setDeploymentId(null);
    setDeploymentEta(null);
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

  const handleSearchSelect = (id: string, kind: 'shortage' | 'alert') => {
    // Bring user to the inventory dashboard and handle selection by kind.
    setActiveTab('inventory-dashboard');
    if (kind === 'shortage') {
      const found = drugShortages.find((s) => s.id === id || s.drugName === id);
      if (found) {
        setSelectedShortageId(found.id);
        // Try to find an existing FDA alert that matches the drug name
        const matchingAlert = alerts.find(
          (a) => a.product === found.drugName || a.product?.toLowerCase().includes(found.drugName.toLowerCase())
        );

        if (matchingAlert) {
          handleAlertClick(matchingAlert);
        } else {
          // Create a lightweight synthetic Alert so the AI panel can operate on context
          const synthetic: Alert = {
            id: `search-s-${found.id}`,
            date: new Date().toISOString(),
            product: found.drugName,
            manufacturer: "",
            reason: found.shortageReason,
            severity: (found.severity?.toLowerCase() as any) || 'medium',
          };
          handleAlertClick(synthetic);
        }
      }
      console.log('AISearch selected shortage:', id);
      return;
    }

    // kind === 'alert'
    const alertMatch = alerts.find((a) => a.id === id);
    if (alertMatch) {
      setSelectedShortageId(null);
      handleAlertClick(alertMatch);
    }
    console.log('AISearch selected alert:', id, alertMatch);
  };

  const handleDeploy = async () => {
    if (!aiAnalysis?.fivetranConfigDraft || !selectedAlert) return;

    setIsDeploying(true);
    setDeploymentId(null);

    try {
      const response = await deployFivetranConfig(aiAnalysis.fivetranConfigDraft);
      if (response && response.connectorId) {
        setDeploymentId(response.connectorId);
      }

      const eta = new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      setDeploymentEta(eta);
      setDeploymentStage('inTransit');
      toast.success('Pipeline deployed and transfer authorized. In transit.');
    } catch (error: any) {
      console.error('Deployment error:', error);
      toast.error(error.message || 'Failed to deploy Fivetran connector.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleConfirmReceipt = () => {
    if (!selectedAlert) return;

    setDeploymentStage('received');
    setSafeAlertIds((current) =>
      current.includes(selectedAlert.id) ? current : [...current, selectedAlert.id]
    );
    toast.success('Physical dock receipt confirmed and inventory marked safe.');
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
              onClick={() => { setActiveTab('inventory-dashboard'); setIsMobileMenuOpen(false); }}
            >
              <Package className="h-4 w-4 opacity-70" /> Inventory Dashboard
            </button>
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

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Center Main Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background/50 relative">
          {activeTab === 'inventory-dashboard' && (
          <div className="flex-1 flex flex-col w-full h-full">
            <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-8 shadow-sm shrink-0">
              <h2 className="text-xl font-semibold tracking-tight">Predictive Inventory Dashboard</h2>
              <div className="ml-6 w-full max-w-lg hidden md:block">
                <AISearchBar onSelect={(id, kind) => handleSearchSelect(id, kind)} />
              </div>
            </header>
            <div className="flex-1 p-8 overflow-auto flex flex-col gap-6">
              {/* Top section: Drug Shortages */}
              <div className="flex-shrink-0">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest opacity-70 mb-4">
                    Active Drug Shortages
                  </h3>
                </div>
                <ShortageFeed
                  shortages={drugShortages}
                  isLoading={inventoryLoading}
                  error={inventoryError}
                  selectedId={selectedShortageId}
                  onSelect={(s) => setSelectedShortageId(s.id)}
                />
              </div>

              {/* Bottom section: Hospital Inventory */}
              <div className="flex-1 min-h-0">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest opacity-70 mb-4">
                    Hospital Inventory Status
                  </h3>
                </div>
                <div className="overflow-hidden rounded-3xl border border-border bg-slate-950/80 p-4 mb-6">
                  <GlobalRadarMap />
                </div>
                <div className="overflow-auto flex-1">
                  <InventoryMatrix
                    telemetry={inventoryTelemetry}
                    prediction={inventoryPrediction}
                    isLoading={inventoryLoading}
                    error={inventoryError}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
                   <GlobalThreatRadar alerts={alerts} safeAlertIds={safeAlertIds} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'risk-matrix' && <InventoryForecast />}
        
        {activeTab === 'fivetran' && <TransferPipelines />}

        {activeTab === 'logs' && <AILogs />}

        {activeTab === 'settings' && <ProjectSettings />}

        {/* Fallback for undeveloped tabs */}
        {!['inventory-dashboard', 'global-radar', 'risk-matrix', 'fivetran', 'settings', 'logs'].includes(activeTab) && (
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

        <AIActionPanel
          alerts={alerts}
          selectedAlert={selectedAlert}
          selectedAlertId={selectedAlert?.id}
          onAlertClick={handleAlertClick}
          alertsLoading={alertsLoading}
          alertsError={alertsError}
          analysisLoading={analysisLoading}
          analysisError={analysisError}
          aiAnalysis={aiAnalysis}
          onDeploy={handleDeploy}
          isDeploying={isDeploying}
          deploymentStage={deploymentStage}
          deploymentId={deploymentId}
          deploymentEta={deploymentEta}
          onConfirmReceipt={handleConfirmReceipt}
        />
      </div>

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