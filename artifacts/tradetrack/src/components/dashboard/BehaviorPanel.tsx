import { formatCurrency, formatPercent, cnPnl } from "@/lib/format";
import type { ExecutionAnalysis } from "@workspace/api-client-react";
import { Sparkles, Flame } from "lucide-react";

interface BehaviorPanelProps {
  analysis: ExecutionAnalysis | undefined;
}

function Cell({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold tabular-nums mt-1 ${valueClassName ?? ""}`}>{value}</div>
    </div>
  );
}

export function BehaviorPanel({ analysis }: BehaviorPanelProps) {
  const cmp = analysis?.qualityComparison;
  const aPlusEdge = cmp ? cmp.pnlA - cmp.pnlB : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Behavior Audit</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Disciplined entries vs impulsive ones
          </p>
        </div>
        {cmp && (
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Edge from discipline
            </div>
            <div className={`text-lg font-bold ${cnPnl(aPlusEdge)}`}>
              {aPlusEdge >= 0 ? "+" : ""}
              {formatCurrency(aPlusEdge)}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-win/20 bg-win/5 p-5 space-y-4">
          <div className="flex items-center gap-2 text-win">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">A+ Trades</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {cmp?.countA ?? 0} trade{(cmp?.countA ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Cell label="Win Rate" value={cmp ? formatPercent(cmp.winRateA) : "—"} />
            <Cell
              label="Total PnL"
              value={cmp ? formatCurrency(cmp.pnlA) : "—"}
              valueClassName={cmp ? cnPnl(cmp.pnlA) : ""}
            />
            <Cell
              label="Avg / Trade"
              value={
                cmp && cmp.countA > 0
                  ? formatCurrency(cmp.pnlA / cmp.countA)
                  : "—"
              }
            />
          </div>
        </div>

        <div className="rounded-lg border border-loss/20 bg-loss/5 p-5 space-y-4">
          <div className="flex items-center gap-2 text-loss">
            <Flame className="h-4 w-4" />
            <span className="font-semibold">FOMO Trades</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {cmp?.countB ?? 0} trade{(cmp?.countB ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Cell label="Win Rate" value={cmp ? formatPercent(cmp.winRateB) : "—"} />
            <Cell
              label="Total PnL"
              value={cmp ? formatCurrency(cmp.pnlB) : "—"}
              valueClassName={cmp ? cnPnl(cmp.pnlB) : ""}
            />
            <Cell
              label="Avg / Trade"
              value={
                cmp && cmp.countB > 0
                  ? formatCurrency(cmp.pnlB / cmp.countB)
                  : "—"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
