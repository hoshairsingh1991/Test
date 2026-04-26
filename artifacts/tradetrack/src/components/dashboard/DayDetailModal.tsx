import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetDayDetail } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, cnPnl } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";

interface DayDetailModalProps {
  date: string | null;
  onClose: () => void;
}

export function DayDetailModal({ date, onClose }: DayDetailModalProps) {
  const { data, isLoading } = useGetDayDetail(
    { date: date ?? "" },
    { query: { enabled: !!date, queryKey: ["dayDetail", date] } },
  );

  return (
    <Dialog open={!!date} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {date ? format(new Date(`${date}T00:00:00Z`), "EEEE, MMM d, yyyy") : ""}
          </DialogTitle>
        </DialogHeader>
        {isLoading || !data ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">PnL</div>
                <div className={`text-xl font-bold tabular-nums mt-1 ${cnPnl(data.pnl)}`}>
                  {formatCurrency(data.pnl)}
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Trades</div>
                <div className="text-xl font-bold tabular-nums mt-1">{data.tradeCount}</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Win Rate</div>
                <div className="text-xl font-bold tabular-nums mt-1">{formatPercent(data.winRate)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.bestTrade && data.bestTrade.pnl > 0 && (
                <div className="rounded-lg border border-win/30 bg-win/5 p-3">
                  <div className="flex items-center gap-2 text-win text-xs uppercase tracking-widest">
                    <ArrowUp className="h-3 w-3" />
                    Best Trade
                  </div>
                  <div className="font-semibold mt-1">
                    {data.bestTrade.symbol} · {data.bestTrade.direction}
                  </div>
                  <div className="text-sm tabular-nums text-win font-bold">
                    {formatCurrency(data.bestTrade.pnl)}
                  </div>
                </div>
              )}
              {data.worstTrade && data.worstTrade.pnl < 0 && (
                <div className="rounded-lg border border-loss/30 bg-loss/5 p-3">
                  <div className="flex items-center gap-2 text-loss text-xs uppercase tracking-widest">
                    <ArrowDown className="h-3 w-3" />
                    Worst Trade
                  </div>
                  <div className="font-semibold mt-1">
                    {data.worstTrade.symbol} · {data.worstTrade.direction}
                  </div>
                  <div className="text-sm tabular-nums text-loss font-bold">
                    {formatCurrency(data.worstTrade.pnl)}
                  </div>
                </div>
              )}
            </div>

            {data.mistakes.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest mb-2">
                  <AlertTriangle className="h-3 w-3" />
                  Mistakes flagged
                </div>
                <ul className="space-y-1">
                  {data.mistakes.map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
