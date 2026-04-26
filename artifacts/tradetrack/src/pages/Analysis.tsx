import { useGetExecutionAnalysis } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatPercent, cnPnl } from "@/lib/format";
import { Activity, Target, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExecutionComparison } from "@workspace/api-client-react";

export default function Analysis() {
  const { data: analysis, isLoading } = useGetExecutionAnalysis();

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (!analysis) return null;

  const ComparisonSection = ({ 
    title, 
    data, 
    icon: Icon,
    goodColor
  }: { 
    title: string; 
    data: ExecutionComparison;
    icon: React.ElementType;
    goodColor: string;
  }) => {
    const winRateDelta = data.winRateA - data.winRateB;
    const pnlDelta = data.pnlA - data.pnlB;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", goodColor)}>
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card space-y-6">
            <h3 className="text-lg font-semibold tracking-tight border-b border-border pb-4">{data.groupA}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                <div className="text-2xl font-bold">{formatPercent(data.winRateA)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total PnL</div>
                <div className={cn("text-2xl font-bold", cnPnl(data.pnlA))}>{formatCurrency(data.pnlA)}</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground pt-4 border-t border-border">
              Sample size: {data.countA} trades
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertTriangle className="h-24 w-24" />
            </div>
            
            <h3 className="text-lg font-semibold tracking-tight border-b border-border pb-4">{data.groupB}</h3>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                <div className="text-2xl font-bold">{formatPercent(data.winRateB)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total PnL</div>
                <div className={cn("text-2xl font-bold", cnPnl(data.pnlB))}>{formatCurrency(data.pnlB)}</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground pt-4 border-t border-border relative z-10">
              Sample size: {data.countB} trades
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold">The Cost of Indiscipline</h4>
              <p className="text-sm text-muted-foreground">Difference between {data.groupA} and {data.groupB}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Win Rate Delta</div>
              <div className={cn("text-xl font-bold", winRateDelta > 0 ? "text-win" : "text-loss")}>
                {winRateDelta > 0 ? "+" : ""}{formatPercent(winRateDelta)}
              </div>
            </div>
            <div className="h-10 w-px bg-border hidden md:block"></div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">PnL Delta</div>
              <div className={cn("text-xl font-bold", pnlDelta > 0 ? "text-win" : "text-loss")}>
                {pnlDelta > 0 ? "+" : ""}{formatCurrency(pnlDelta)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasData = analysis.emaComparison.countA > 0 || analysis.qualityComparison.countA > 0;

  if (!hasData) {
    return (
      <AppShell>
        <div className="flex h-[70vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Not enough data for analysis</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Log more trades with accurate EMA alignment and execution quality ratings to see insights.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Execution Analysis</h1>
          <p className="text-muted-foreground mt-2">Identify the behaviors that are making or costing you money.</p>
        </div>

        {analysis.qualityComparison.countA > 0 && (
          <ComparisonSection 
            title="Execution Quality Impact" 
            data={analysis.qualityComparison} 
            icon={Target}
            goodColor="bg-green-500/20 text-green-500"
          />
        )}

        {analysis.emaComparison.countA > 0 && (
          <ComparisonSection 
            title="Trend Alignment Impact (EMA)" 
            data={analysis.emaComparison} 
            icon={ArrowRight}
            goodColor="bg-blue-500/20 text-blue-500"
          />
        )}
      </div>
    </AppShell>
  );
}
