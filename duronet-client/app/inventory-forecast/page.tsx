import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CalendarDays, Database, TrendingDown } from "lucide-react";

const inventoryForecastData = [
  {
    drugName: "Albuterol Sulfate",
    currentStock: 1200,
    burnRate7d: 910,
    predictedDepletion: "2026-06-07",
    status: "At Risk",
  },
  {
    drugName: "Lidocaine HCl",
    currentStock: 300,
    burnRate7d: 700,
    predictedDepletion: "2026-06-02",
    status: "Critical",
  },
  {
    drugName: "Saline Flush Syringes",
    currentStock: 5000,
    burnRate7d: 2800,
    predictedDepletion: "2026-06-12",
    status: "Stable",
  },
  {
    drugName: "Midazolam Injection",
    currentStock: 1800,
    burnRate7d: 1500,
    predictedDepletion: "2026-06-09",
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
      return <Badge variant="default">Stable</Badge>;
  }
};

export default function InventoryForecastPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400/70">Enterprise Analytics</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Inventory Forecast</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Predictive SKU burn rates across the enterprise with projected depletion dates and risk tiering.
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
              href="/transfer-pipelines"
              className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Transfer Pipelines
            </Link>
            <Link
              href="/ai-logs"
              className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              AI Logs
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-emerald-700/40 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-emerald-300" />
                <CardTitle>SKU Coverage</CardTitle>
              </div>
              <CardDescription>Estimated forecast coverage for mission-critical medication stock.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="text-3xl font-semibold text-white">4</div>
              <p className="text-sm text-slate-400">Tracked enterprise SKUs with predictive depletion analysis.</p>
            </CardContent>
          </Card>
          <Card className="border-teal-700/40 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-teal-300" />
                <CardTitle>7-Day Burn</CardTitle>
              </div>
              <CardDescription>Aggregate expected consumption across all supply nodes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="text-3xl font-semibold text-white">6,910</div>
              <p className="text-sm text-slate-400">Units expected to be consumed in the next 7 days.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700/50 bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-slate-300" />
                <CardTitle>Depletion Horizon</CardTitle>
              </div>
              <CardDescription>Visualize which medicines require urgent supply chain actions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="text-3xl font-semibold text-white">2</div>
              <p className="text-sm text-slate-400">SKUs projected to fall below safe stock in the next week.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 overflow-hidden border-emerald-700/30 bg-slate-900/80 shadow-xl shadow-emerald-950/20">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Forecast Burn Rate Table</CardTitle>
                <CardDescription>Enterprise grade inventory signal for next-phase sourcing.</CardDescription>
              </div>
              <Badge variant="default">Live Mock Data</Badge>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto px-0 pb-6 pt-0">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-950/80 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Drug Name</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Current Stock</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">7-Day Burn Rate</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Predicted Depletion</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-[0.18em]">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryForecastData.map((item) => (
                  <tr key={item.drugName} className="border-t border-slate-800/80 text-slate-200 last:border-b last:border-slate-800/80">
                    <td className="px-6 py-4 font-medium text-white">{item.drugName}</td>
                    <td className="px-6 py-4">{item.currentStock.toLocaleString()}</td>
                    <td className="px-6 py-4">{item.burnRate7d.toLocaleString()}</td>
                    <td className="px-6 py-4">{item.predictedDepletion}</td>
                    <td className="px-6 py-4">{statusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
