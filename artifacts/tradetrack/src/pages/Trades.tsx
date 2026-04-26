import { useState } from "react";
import { useListTrades, useDeleteTrade, getListTradesQueryKey, getGetMetricsSummaryQueryKey, getGetEquityCurveQueryKey, getGetWinLossQueryKey, getGetPerformanceBySetupQueryKey, getGetPerformanceBySessionQueryKey, getGetExecutionAnalysisQueryKey, getGetWeeklyReviewQueryKey } from "@workspace/api-client-react";
import type { SetupType, Session, ExecutionQuality, ListTradesSortBy, ListTradesSortDir } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TagPill } from "@/components/ui/tag-pill";
import { formatCurrency, formatPercent, cnPnl } from "@/lib/format";
import { Activity, ArrowDown, ArrowUp, ArrowUpDown, Target, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Trades() {
  const [setup, setSetup] = useState<SetupType | undefined>();
  const [session, setSession] = useState<Session | undefined>();
  const [execution, setExecution] = useState<ExecutionQuality | undefined>();
  const [sortBy, setSortBy] = useState<ListTradesSortBy>("date");
  const [sortDir, setSortDir] = useState<ListTradesSortDir>("desc");

  const { data: trades, isLoading } = useListTrades({ setup, session, execution, sortBy, sortDir });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteTrade = useDeleteTrade({
    mutation: {
      onSuccess: () => {
        toast({ title: "Trade deleted" });
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMetricsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetEquityCurveQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWinLossQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySetupQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySessionQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetExecutionAnalysisQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklyReviewQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete trade", variant: "destructive" });
      }
    }
  });

  const toggleSort = (col: ListTradesSortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: ListTradesSortBy }) => {
    if (sortBy !== col) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Trade History</h1>
          <Link href="/trades/new">
            <Button>New Trade</Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16">Setup</span>
            <Select value={setup || "all"} onValueChange={(v) => setSetup(v === "all" ? undefined : v as SetupType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Setups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Setups</SelectItem>
                <SelectItem value="Pullback">Pullback</SelectItem>
                <SelectItem value="Breakout">Breakout</SelectItem>
                <SelectItem value="Reversal">Reversal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16 sm:w-auto">Session</span>
            <Select value={session || "all"} onValueChange={(v) => setSession(v === "all" ? undefined : v as Session)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="London">London</SelectItem>
                <SelectItem value="NY">NY</SelectItem>
                <SelectItem value="Asia">Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16 sm:w-auto">Quality</span>
            <Select value={execution || "all"} onValueChange={(v) => setExecution(v === "all" ? undefined : v as ExecutionQuality)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="A+">A+ (Perfect)</SelectItem>
                <SelectItem value="B">B (Acceptable)</SelectItem>
                <SelectItem value="FOMO">FOMO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(setup || session || execution) && (
            <Button variant="ghost" size="sm" onClick={() => { setSetup(undefined); setSession(undefined); setExecution(undefined); }} className="ml-auto text-muted-foreground">
              Clear Filters
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !trades || trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Target className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No trades found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {(setup || session || execution) ? "Try adjusting your filters." : "Log a trade to see it here."}
              </p>
              {!(setup || session || execution) && (
                <Link href="/trades/new">
                  <Button variant="outline">Log Trade</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border">
                    <TableHead className="w-[140px] cursor-pointer" onClick={() => toggleSort("date")}>
                      <div className="flex items-center">Date <SortIcon col="date" /></div>
                    </TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Entry / Exit</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("pnl")}>
                      <div className="flex items-center justify-end">PnL <SortIcon col="pnl" /></div>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id} className="border-border hover:bg-muted/50 transition-colors group">
                      <TableCell className="font-medium whitespace-nowrap text-muted-foreground">
                        {new Date(trade.tradedAt).toLocaleString(undefined, { 
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="font-bold">{trade.symbol}</TableCell>
                      <TableCell>
                        <span className={trade.direction === "Long" ? "text-green-500" : "text-red-500"}>
                          {trade.direction}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        <span className="text-muted-foreground">{trade.entryPrice}</span>
                        <span className="mx-1 text-muted-foreground/50">→</span>
                        <span>{trade.exitPrice}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <TagPill type="setup" value={trade.setupType} />
                          <TagPill type="session" value={trade.session} />
                          <TagPill type="execution" value={trade.executionQuality} />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono font-medium ${cnPnl(trade.pnl)}`}>
                            {formatCurrency(trade.pnl)}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {trade.rr > 0 ? "+" : ""}{trade.rr.toFixed(2)}R
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this {trade.symbol} {trade.direction} trade? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteTrade.mutate({ id: trade.id })}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
