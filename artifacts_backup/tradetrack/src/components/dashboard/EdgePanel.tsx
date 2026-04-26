import { TrendingDown, TrendingUp, Clock, Layers } from "lucide-react";
import { formatCurrency, cnPnl } from "@/lib/format";
import type { GroupedPerformance } from "@workspace/api-client-react";

interface EdgePanelProps {
  bySetup: GroupedPerformance[] | undefined;
  bySession: GroupedPerformance[] | undefined;
}

function pickBestWorst(rows: GroupedPerformance[] | undefined) {
  if (!rows || rows.length === 0) return { best: null, worst: null };
  const sorted = [...rows].sort((a, b) => b.totalPnl - a.totalPnl);
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
}

function Row({
  label,
  group,
  positive,
  icon,
}: {
  label: string;
  group: GroupedPerformance | null;
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-md ${positive ? "bg-win/10 text-win" : "bg-loss/10 text-loss"}`}
        >
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <div className="font-semibold mt-0.5">{group?.label ?? "—"}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold tabular-nums ${cnPnl(group?.totalPnl ?? 0)}`}>
          {group ? formatCurrency(group.totalPnl) : "—"}
        </div>
        <div className="text-xs text-muted-foreground">
          {group ? `${group.tradeCount} trade${group.tradeCount === 1 ? "" : "s"}` : ""}
        </div>
      </div>
    </div>
  );
}

export function EdgePanel({ bySetup, bySession }: EdgePanelProps) {
  const setup = pickBestWorst(bySetup);
  const session = pickBestWorst(bySession);

  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold tracking-tight">Your Edge</h3>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          What's working
        </span>
      </div>
      <div className="flex flex-col">
        <Row
          label="Best setup"
          group={setup.best}
          positive
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Row
          label="Worst setup"
          group={setup.worst}
          positive={false}
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <Row
          label="Best session"
          group={session.best}
          positive
          icon={<Layers className="h-4 w-4" />}
        />
        <Row
          label="Worst session"
          group={session.worst}
          positive={false}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
