import { useGetMetricsSummary, useGetEquityCurve, useGetWinLoss, useGetPerformanceBySetup, useGetPerformanceBySession } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatPercent, cnPnl } from "@/lib/format";
import { Activity, DollarSign, Percent, TrendingUp, ArrowDownToLine, ArrowUpToLine, Target, Upload } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import { ImportTradesDialog } from "@/components/ImportTradesDialog";

export default function Dashboard() {
  const [importOpen, setImportOpen] = useState(false);
  const { data: metrics, isLoading: metricsLoading } = useGetMetricsSummary();
  const { data: equity, isLoading: equityLoading } = useGetEquityCurve();
  const { data: winLoss, isLoading: winLossLoading } = useGetWinLoss();
  const { data: bySetup, isLoading: bySetupLoading } = useGetPerformanceBySetup();
  const { data: bySession, isLoading: bySessionLoading } = useGetPerformanceBySession();

  const isLoading = metricsLoading || equityLoading || winLossLoading || bySetupLoading || bySessionLoading;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!metrics || metrics.tradeCount === 0) {
    return (
      <AppShell>
        <div className="flex h-[70vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No trades logged yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Start logging your trades to see your performance metrics, equity curve, and actionable insights.
          </p>
          <div className="flex gap-3">
            <Link href="/trades/new">
              <Button size="lg">Log Your First Trade</Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setImportOpen(true)}
              data-testid="button-import-trades-empty"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>
        <ImportTradesDialog open={importOpen} onOpenChange={setImportOpen} />
      </AppShell>
    );
  }

  const pieData = winLoss ? [
    { name: "Wins", value: winLoss.wins, color: "hsl(var(--win))" },
    { name: "Losses", value: winLoss.losses, color: "hsl(var(--loss))" },
    { name: "Breakeven", value: winLoss.breakeven, color: "hsl(var(--muted-foreground))" },
  ].filter(d => d.value > 0) : [];

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              data-testid="button-import-trades"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Trades
            </Button>
            <Link href="/trades/new">
              <Button data-testid="button-new-trade">New Trade</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total PnL"
            value={formatCurrency(metrics.totalPnl)}
            valueClassName={cnPnl(metrics.totalPnl)}
            icon={<DollarSign />}
            className="xl:col-span-2"
          />
          <StatCard
            title="Win Rate"
            value={formatPercent(metrics.winRate)}
            icon={<Percent />}
          />
          <StatCard
            title="Expectancy"
            value={`${metrics.expectancyR.toFixed(2)} R`}
            icon={<Activity />}
          />
          <StatCard
            title="Avg Win"
            value={formatCurrency(metrics.avgWin)}
            valueClassName="text-win"
            icon={<ArrowUpToLine />}
          />
          <StatCard
            title="Avg Loss"
            value={formatCurrency(metrics.avgLoss)}
            valueClassName="text-loss"
            icon={<ArrowDownToLine />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card flex flex-col">
            <h3 className="text-lg font-semibold tracking-tight mb-6">Equity Curve</h3>
            <div className="flex-1 min-h-[300px]">
              {equity && equity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equity}>
                    <defs>
                      <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tickFormatter={(val) => `$${val}`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [formatCurrency(value), "Cumulative PnL"]}
                      labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="cumulativePnl" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorPnl)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Not enough data</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card flex flex-col">
            <h3 className="text-lg font-semibold tracking-tight mb-6">Win / Loss Ratio</h3>
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground text-sm">Not enough data</div>
              )}
              {pieData.length > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold">{formatPercent(metrics.winRate)}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Win Rate</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card flex flex-col">
            <h3 className="text-lg font-semibold tracking-tight mb-6">Performance by Setup</h3>
            <div className="flex-1 min-h-[250px]">
              {bySetup && bySetup.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySetup} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <YAxis type="category" dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [formatCurrency(value), "PnL"]}
                    />
                    <Bar dataKey="totalPnl" radius={[0, 4, 4, 0]}>
                      {bySetup.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.totalPnl >= 0 ? "hsl(var(--win))" : "hsl(var(--loss))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Not enough data</div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card flex flex-col">
            <h3 className="text-lg font-semibold tracking-tight mb-6">Performance by Session</h3>
            <div className="flex-1 min-h-[250px]">
              {bySession && bySession.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySession} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <YAxis type="category" dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [formatCurrency(value), "PnL"]}
                    />
                    <Bar dataKey="totalPnl" radius={[0, 4, 4, 0]}>
                      {bySession.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.totalPnl >= 0 ? "hsl(var(--win))" : "hsl(var(--loss))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Not enough data</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ImportTradesDialog open={importOpen} onOpenChange={setImportOpen} />
    </AppShell>
  );
}
