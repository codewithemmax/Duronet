import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const pipelineSyncs = [
  {
    name: "Hospital Inventory Sync",
    location: "North Hub",
    frequency: "Every 15m",
    progress: 82,
    rowsSynced: 18432,
    status: "Healthy",
  },
  {
    name: "Emergency Orders Feed",
    location: "Central Ops",
    frequency: "Every 5m",
    progress: 56,
    rowsSynced: 11200,
    status: "Syncing",
  },
  {
    name: "Cold Chain Audit",
    location: "Sensor Grid",
    frequency: "Hourly",
    progress: 100,
    rowsSynced: 29700,
    status: "Healthy",
  },
  {
    name: "Supplier Reconciliation",
    location: "Vendor Ledger",
    frequency: "Daily",
    progress: 18,
    rowsSynced: 4200,
    status: "Failed",
  },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "Failed":
      return <Badge variant="destructive">Failed</Badge>;
    case "Syncing":
      return <Badge variant="secondary">Syncing</Badge>;
    default:
      return <Badge variant="default">Healthy</Badge>;
  }
};

export function TransferPipelines() {
  return (
    <section className="flex-1 flex flex-col overflow-hidden bg-background/60">
      <div className="flex h-16 items-center justify-between border-b border-border px-8 bg-card/80 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Pipeline Monitoring</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Transfer Pipelines</h2>
        </div>
        <div className="rounded-2xl border border-teal-700/40 bg-slate-900/80 px-4 py-2 text-sm text-teal-200">
          Fivetran sync health overview
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          <Card className="border-teal-700/40 bg-slate-950/80 shadow-xl shadow-teal-950/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Active Syncs</CardTitle>
              <CardDescription className="text-slate-400">Currently monitored data flows.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">4</div>
            </CardContent>
          </Card>
          <Card className="border-emerald-700/40 bg-slate-950/80 shadow-xl shadow-emerald-950/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Throughput</CardTitle>
              <CardDescription className="text-slate-400">Rows processed in the last hour.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">63,332</div>
            </CardContent>
          </Card>
          <Card className="border-slate-700/50 bg-slate-950/80 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Failures</CardTitle>
              <CardDescription className="text-slate-400">Syncs requiring operator review.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">1</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {pipelineSyncs.map((sync) => (
            <Card key={sync.name} className="overflow-hidden border border-border bg-slate-950/90 shadow-lg shadow-slate-950/20">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg text-white">{sync.name}</CardTitle>
                  <CardDescription className="text-slate-400">{sync.location}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{sync.frequency}</Badge>
                  {statusBadge(sync.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 border-t border-slate-800/70 pt-4">
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Rows synced</span>
                    <span className="font-semibold text-white">{sync.rowsSynced.toLocaleString()}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-300"
                      style={{ width: `${sync.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>Sync progress</span>
                    <span>{sync.progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
