"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Globe, Grid, Bell, Database, Server, Terminal, Settings, Zap } from "lucide-react";

export const ENTERPRISE_MODULES = [
  {
    id: "ehr-sync",
    name: "Live EHR Sync",
    description: "Real-time synchronization with Electronic Health Records systems",
    icon: Zap,
  },
  {
    id: "po-generation",
    name: "Automated PO Generation",
    description: "Automatically generate purchase orders based on supply chain recommendations",
    icon: Zap,
  },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onModuleClick: (module: typeof ENTERPRISE_MODULES[0]) => void;
}

export function Sidebar({ activeTab, setActiveTab, onModuleClick }: SidebarProps) {
  const getLinkStyle = (id: string) => {
    const isActive = activeTab === id;
    return isActive
      ? "w-full flex items-center gap-3 px-3 py-2 bg-secondary/80 text-secondary-foreground rounded-md cursor-pointer font-medium hover:bg-secondary transition-colors text-sm"
      : "w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-foreground rounded-md cursor-pointer transition-colors font-medium text-sm";
  };

  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shrink-0">
      <div className="p-6 border-b border-border flex items-center gap-2">
        <img src="/duronet-icon.svg" alt="DuroNet Icon" className="h-8 w-8" />
        <h1 className="text-2xl font-bold text-primary tracking-tight">DuroNet</h1>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Group 1: Core */}
        <div className="mb-6">
          <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Core
          </div>
          <div className="space-y-1">
            <button onClick={() => setActiveTab('global-radar')} className={getLinkStyle('global-radar')}>
              <Globe className="h-4 w-4 opacity-70" /> Global Radar
            </button>
            <button onClick={() => setActiveTab('risk-matrix')} className={getLinkStyle('risk-matrix')}>
              <Grid className="h-4 w-4 opacity-70" /> Risk Matrix
            </button>
            <button onClick={() => setActiveTab('alerts')} className={getLinkStyle('alerts')}>
              <Bell className="h-4 w-4 opacity-70" /> Alert Feed
            </button>
          </div>
        </div>

        <hr className="border-border/50 my-4" />

        {/* Group 2: Data Pipelines */}
        <div className="mb-6">
          <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Data Pipelines
          </div>
          <div className="space-y-1">
            <button onClick={() => setActiveTab('fivetran')} className={getLinkStyle('fivetran')}>
              <Database className="h-4 w-4 opacity-70" /> Fivetran Connectors
            </button>
            <button onClick={() => setActiveTab('suppliers')} className={getLinkStyle('suppliers')}>
              <Server className="h-4 w-4 opacity-70" /> Supplier Database
            </button>
            <button onClick={() => setActiveTab('logs')} className={getLinkStyle('logs')}>
              <Terminal className="h-4 w-4 opacity-70" /> AI Logs
            </button>
          </div>
        </div>

        <hr className="border-border/50 my-4" />

        {/* Group 3: Enterprise Modules */}
        <div className="mb-6">
          <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Enterprise Modules
          </div>
          <div className="space-y-1">
            {ENTERPRISE_MODULES.map((module) => {
              const IconComponent = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleClick(module)}
                  className="w-full group relative px-3 py-2 text-left text-muted-foreground hover:text-foreground hover:bg-secondary/30 rounded-md transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <IconComponent className="h-4 w-4 flex-shrink-0 opacity-70" />
                    <span className="text-sm font-medium truncate">{module.name}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5 flex-shrink-0">
                    Beta
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-border/50 my-4" />

        {/* Group 4: Configuration */}
        <div className="mb-2">
          <div className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            Configuration
          </div>
          <div className="space-y-1">
            <button onClick={() => setActiveTab('settings')} className={getLinkStyle('settings')}>
              <Settings className="h-4 w-4 opacity-70" /> Project Settings
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}
