import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const forecastRows = [
  {
    sku: "Albuterol Sulfate",
    currentStock: 1200,
    burnRate7d: 910,
    depletionDate: "2026-06-07",
    status: "At Risk",
  },
  {
    sku: "Lidocaine HCl",
    currentStock: 300,
    burnRate7d: 700,
    depletionDate: "2026-06-02",
    status: "Critical",
  },
  {
    sku: "Saline Flush Syringes",
    currentStock: 5000,
    burnRate7d: 2800,
    depletionDate: "2026-06-12",
    status: "Stable",
  },
  {
    sku: "Midazolam Injection",
    currentStock: 1800,
    burnRate7d: 1500,
    depletionDate: "2026-06-09",
    status: "Watchlist",
  },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "Critical":
      return <Badge variant="destructive">Critical</Badge>;
    case "At Risk":
      return <Badge variant="secondary">At Risk</Badge>;
    case "Watchlist":
      return <Badge variant="outline">Watchlist</Badge>;
    default:
      return <Badge variant="default">Safe</Badge>;
  }
};

export function InventoryForecast() {
  return (
    <section className="flex-1 flex flex-col overflow-hidden bg-background/60">
      <div className="flex h-16 items-center justify-between border-b border-border px-8 bg-card/80 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-300/80">Risk Analytics</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Inventory Forecast</h2>
        </div>
        <div className="rounded-2xl border border-emerald-700/40 bg-slate-900/80 px-4 py-2 text-sm text-emerald-200">
          High-fidelity SKU prediction view
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="grid gap-4 lg:grid-cols-3 mb-6">
          <Card className="border-emerald-700/40 bg-slate-950/80 shadow-xl shadow-emerald-950/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Forecast Coverage</CardTitle>
              <CardDescription className="text-slate-400">Tracked SKUs with predictive demand signals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">4</div>
            </CardContent>
          </Card>
          <Card className="border-teal-700/40 bg-slate-950/80 shadow-xl shadow-teal-950/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Weekly Burn</CardTitle>
              <CardDescription className="text-slate-400">Projected consumption over the next seven days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">6,910</div>
            </CardContent>
          </Card>
          <Card className="border-slate-700/50 bg-slate-950/80 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Urgent Flags</CardTitle>
              <CardDescription className="text-slate-400">SKUs approaching depletion in the next 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-white">2</div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border border-border bg-slate-950/90 shadow-lg shadow-slate-950/20">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl text-white">Predictive Burn Rate Table</CardTitle>
              <CardDescription className="text-slate-400">
                Enterprise-grade forecast across critical medical supply SKUs.
              </CardDescription>
            </div>
            <Badge variant="default">Static Mock</Badge>
          </CardHeader>
          <CardContent className="overflow-x-auto px-0 pb-6 pt-0">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">SKU / Drug Name</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Current Stock</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">7-Day Burn Rate</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Predicted Depletion</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Status</th>
                </tr>
              </thead>
              <tbody>
                {forecastRows.map((row) => (
                  <tr key={row.sku} className="border-t border-slate-800/70 text-slate-200 last:border-b last:border-slate-800/70">
                    <td className="px-6 py-4 font-medium text-white">{row.sku}</td>
                    <td className="px-6 py-4">{row.currentStock.toLocaleString()}</td>
                    <td className="px-6 py-4">{row.burnRate7d.toLocaleString()}</td>
                    <td className="px-6 py-4">{row.depletionDate}</td>
                    <td className="px-6 py-4">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
