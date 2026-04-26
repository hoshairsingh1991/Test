import { useGetWeeklyReview } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { formatCurrency, cnPnl } from "@/lib/format";
import { Activity, Calendar, Trophy, AlertOctagon, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Review() {
  const { data: review, isLoading } = useGetWeeklyReview();

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!review || review.tradeCount === 0) {
    return (
      <AppShell>
        <div className="flex h-[70vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No trades this week</h2>
          <p className="text-muted-foreground max-w-md">
            Log some trades this week to generate your weekly review.
          </p>
        </div>
      </AppShell>
    );
  }

  const weekStart = new Date(review.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const weekEnd = new Date(review.weekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weekly Review</h1>
            <p className="text-muted-foreground mt-2">
              {weekStart} - {weekEnd}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg px-4 py-2 flex items-center gap-4">
            <div className="text-sm text-muted-foreground">Weekly PnL</div>
            <div className={cn("text-2xl font-bold", cnPnl(review.totalPnl))}>
              {formatCurrency(review.totalPnl)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trophy className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 text-green-500">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-semibold uppercase tracking-wider text-sm">Best Setup</h3>
              </div>
              <div className="text-3xl font-bold">
                {review.bestSetup || "N/A"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This setup generated the most profit for you this week.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <AlertOctagon className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 text-red-500">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold uppercase tracking-wider text-sm">Worst Setup</h3>
              </div>
              <div className="text-3xl font-bold">
                {review.worstSetup || "N/A"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This setup cost you the most money this week.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 text-blue-500">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="font-semibold uppercase tracking-wider text-sm">Best Session</h3>
              </div>
              <div className="text-3xl font-bold">
                {review.bestSession || "N/A"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your most profitable trading window.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 text-orange-500">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="font-semibold uppercase tracking-wider text-sm">Most Common Mistake</h3>
              </div>
              <div className="text-3xl font-bold">
                {review.mostCommonMistake || "None logged"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on your execution quality ratings.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-xl border border-border bg-muted/30 text-center">
          <h3 className="text-lg font-semibold mb-2">Weekly Goal</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Review your worst setup and most common mistake. What is ONE actionable rule you will follow next week to improve?
          </p>
          <div className="max-w-xl mx-auto bg-background border border-border rounded-lg p-4 text-left shadow-sm flex gap-4 items-start">
            <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-muted-foreground italic">
              e.g., "I will wait for a 5-minute candle close before entering {review.worstSetup || "Breakout"} trades."
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
