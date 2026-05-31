import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, Cloud, RefreshCw, ShieldCheck } from "lucide-react";

const syncStreams = [
  {
    name: "Hospital Inventory Sync",
    frequency: "Every 15m",
    progress: 82,
    status: "Healthy",
    endpoint: "FHIR → Supply Lake",
  },
  {
    name: "Emergency Orders Feed",
    frequency: "Every 5m",
    progress: 39,
    status: "Healthy",
    endpoint: "GPO Alerts → Operations",
  },
  {
    name: "Cold Chain Audit",
    frequency: "Hourly",
    progress: 100,
    status: "Healthy",
    endpoint: "Sensor Logs → Analytics",
  },
  {
    name: "Supplier Reconciliation",
    frequency: "Daily",
    progress: 12,
    status: "Failed",
    endpoint: "Vendor Ledger → ERP",
  },
];

const statusBadge = (status: string) => {
  return status === "Healthy" ? (
    <Badge variant="default">Healthy</Badge>
  ) : (
    <Badge variant="destructive">Failed</Badge>
  );
};

export default function TransferPipelinesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-teal-400/70">Pipeline Operations</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Transfer Pipelines</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Real-time sync monitoring and pipeline health indicators for the enterprise data fabric.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full border border-emerald-700 bg-emerald-950/40 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-700/20"
            >
              Dashboard
            </Link>
            <Link
              href="/inventory-forecast"
              className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Inventory Forecast
            </Link>
            <Link
              href="/ai-logs"
              className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              AI Logs
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-teal-700/40 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-teal-300" />
                <CardTitle>Active Sync Performance</CardTitle>
              </div>
              <CardDescription>Track pipeline throughput and signal degraded connectors before outages occur.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="text-3xl font-semibold text-white">4</div>
              <p className="text-sm text-slate-400">Monitored active syncs across mission-critical data flows.</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-700/40 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <CardTitle>Pipeline SLA</CardTitle>
              </div>
              <CardDescription>Automated monitoring for sync latency and failure propagation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="text-3xl font-semibold text-white">98.7%</div>
              <p className="text-sm text-slate-400">Current on-time sync rate for enterprise data ingestion.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 space-y-4">
          {syncStreams.map((stream) => (
            <Card key={stream.name} className="overflow-hidden border-slate-700/60 bg-slate-900/85 shadow-lg shadow-slate-950/20">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-xl text-white">{stream.name}</CardTitle>
                  <CardDescription>{stream.endpoint}</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{stream.frequency}</Badge>
                  {statusBadge(stream.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                    <span>Sync Progress</span>
                    <span className="font-medium text-white">{stream.progress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-500"
                      style={{ width: `${stream.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <RefreshCw className="h-4 w-4" />
                  <span>Stream configured with enterprise-grade retry and backoff policy.</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
