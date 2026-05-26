import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Activity, Clock, CheckCircle2 } from "lucide-react";

export function FivetranConnectors() {
  const activeConnectors = [
    { id: 1, name: "MedSupply Co. API -> Snowflake Data Warehouse", time: "2 mins ago" },
    { id: 2, name: "FDA Recall RSS -> PostgreSQL", time: "15 mins ago" },
    { id: 3, name: "Global Logistics Webhook -> Redshift", time: "5 mins ago" },
    { id: 4, name: "EuroSynthetics ERP -> Snowflake", time: "8 mins ago" }
  ];

  return (
    <div className="flex flex-col p-8 space-y-8 w-full h-full overflow-y-auto bg-background/50">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Data Pipelines</h1>
          <p className="text-muted-foreground mt-1">Live Fivetran synchronization status and metrics.</p>
        </div>
      </div>

      {/* Metrics Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rows Synced</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.4M</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pipelines</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sync Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45s</div>
          </CardContent>
        </Card>
      </div>

      {/* Connectors List Bottom Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 tracking-tight">Connector Status</h2>
        <div className="space-y-4">
          {activeConnectors.map((connector) => (
            <div 
              key={connector.id} 
              className="flex items-center justify-between p-4 border border-border bg-card shadow-sm rounded-xl transition-all hover:border-primary/50"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary/50 border border-border flex items-center justify-center">
                  <Database className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{connector.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Last Sync: {connector.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2.5 py-0.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Healthy
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}