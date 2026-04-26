import { useState } from "react";
import {
  useGetMetricsSummary,
  useGetEquityCurve,
  useGetWinLoss,
  useGetPerformanceBySetup,
  useGetPerformanceBySession,
  useGetExecutionAnalysis,
  useGetCalendar,
} from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar, type Timeframe } from "@/components/dashboard/TopBar";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { PnlChart } from "@/components/dashboard/PnlChart";
import { EdgePanel } from "@/components/dashboard/EdgePanel";
import { BehaviorPanel } from "@/components/dashboard/BehaviorPanel";
import { CalendarHeatmap } from "@/components/dashboard/CalendarHeatmap";
import { DayDetailModal } from "@/components/dashboard/DayDetailModal";
import { WeeklyIntelligence } from "@/components/dashboard/WeeklyIntelligence";
import { PnlBreakdown } from "@/components/dashboard/PnlBreakdown";
import { TradeDistribution } from "@/components/dashboard/TradeDistribution";
import { ImportTradesDialog } from "@/components/ImportTradesDialog";
import { Button } from "@/components/ui/button";
import { Activity, Target, Upload } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, formatPercent, cnPnl } from "@/lib/format";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [importOpen, setImportOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const params = { timeframe, date: date.toISOString() };

  const { data: metrics, isLoading: metricsLoading } = useGetMetricsSummary(params);
  const { data: equity } = useGetEquityCurve(params);
  const { data: winLoss } = useGetWinLoss(params);
  const { data: bySetup } = useGetPerformanceBySetup(params);
  const { data: bySession } = useGetPerformanceBySession(params);
  const { data: analysis } = useGetExecutionAnalysis(params);
  const { data: calendar } = useGetCalendar({ date: calendarMonth.toISOString() });

  if (metricsLoading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  // Detect "no trades anywhere" - check the overall summary, not the period
  const hasNoData =
    metrics &&
    metrics.tradeCount === 0 &&
    metrics.previous.tradeCount === 0 &&
    (!calendar || calendar.length === 0);

  if (hasNoData) {
    return (
      <AppShell>
        <div className="flex h-[70vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No trades logged yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Log your first trade or import from CSV to unlock your trading command center.
          </p>
          <div className="flex gap-3">
            <Link href="/trades/new">
              <Button size="lg" data-testid="button-first-trade">
                Log Your First Trade
              </Button>
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

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        <TopBar
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          date={date}
          onDateChange={setDate}
          onImport={() => setImportOpen(true)}
        />

        {/* Performance strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <PerformanceCard
            label="Net PnL"
            value={metrics ? formatCurrency(metrics.totalPnl) : "—"}
            valueClassName={metrics ? cnPnl(metrics.totalPnl) : ""}
            current={metrics?.totalPnl ?? 0}
            previous={metrics?.previous.totalPnl ?? 0}
          />
          <PerformanceCard
            label="Win Rate"
            value={metrics ? formatPercent(metrics.winRate) : "—"}
            current={metrics?.winRate ?? 0}
            previous={metrics?.previous.winRate ?? 0}
            formatDelta={(d) =>
              `${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)}pp`
            }
          />
          <PerformanceCard
            label="Expectancy"
            value={metrics ? `${metrics.expectancyR.toFixed(2)} R` : "—"}
            current={metrics?.expectancyR ?? 0}
            previous={metrics?.previous.expectancyR ?? 0}
            formatDelta={(d) => `${d >= 0 ? "+" : ""}${d.toFixed(2)} R`}
          />
          <PerformanceCard
            label="Avg R"
            value={metrics ? `${metrics.avgR.toFixed(2)} R` : "—"}
            current={metrics?.avgR ?? 0}
            previous={metrics?.previous.avgR ?? 0}
            formatDelta={(d) => `${d >= 0 ? "+" : ""}${d.toFixed(2)} R`}
          />
        </div>

        {/* Main: chart + edge */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-7">
            <PnlChart data={equity} timeframe={timeframe} />
          </div>
          <div className="lg:col-span-3">
            <EdgePanel bySetup={bySetup} bySession={bySession} />
          </div>
        </div>

        {/* Behavior */}
        <BehaviorPanel analysis={analysis} />

        {/* Calendar */}
        <CalendarHeatmap
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          data={calendar}
          onDayClick={setSelectedDay}
        />

        {/* Bottom analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PnlBreakdown title="PnL Breakdown by Setup" rows={bySetup} />
          </div>
          <TradeDistribution data={winLoss} />
        </div>

        {/* Weekly intelligence */}
        <WeeklyIntelligence />
      </div>

      <ImportTradesDialog open={importOpen} onOpenChange={setImportOpen} />
      <DayDetailModal date={selectedDay} onClose={() => setSelectedDay(null)} />
    </AppShell>
  );
}
