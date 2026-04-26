import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { useQueryClient } from "@tanstack/react-query";
import {
  useImportTrades,
  getListTradesQueryKey,
  getGetMetricsSummaryQueryKey,
  getGetEquityCurveQueryKey,
  getGetWinLossQueryKey,
  getGetPerformanceBySetupQueryKey,
  getGetPerformanceBySessionQueryKey,
  getGetExecutionAnalysisQueryKey,
  getGetWeeklyReviewQueryKey,
} from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseIbkrCsv, type ParsedTrade } from "@/lib/csv-import";

interface ImportTradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTradesDialog({ open, onOpenChange }: ImportTradesDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedTrade[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [skippedRows, setSkippedRows] = useState(0);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importMutation = useImportTrades({
    mutation: {
      onSuccess: (data) => {
        toast({
          title: "Import complete",
          description:
            data.skippedDuplicates > 0
              ? `${data.imported} imported, ${data.skippedDuplicates} duplicate(s) skipped.`
              : `${data.imported} trade${data.imported === 1 ? "" : "s"} imported.`,
        });
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMetricsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetEquityCurveQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWinLossQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySetupQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySessionQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetExecutionAnalysisQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklyReviewQueryKey() });
        reset();
        onOpenChange(false);
      },
      onError: (err: unknown) => {
        toast({
          title: "Import failed",
          description: err instanceof Error ? err.message : "Unknown error.",
          variant: "destructive",
        });
      },
    },
  });

  function reset() {
    setFileName(null);
    setParsed([]);
    setParseError(null);
    setSkippedRows(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFile(file: File) {
    setParseError(null);
    setParsed([]);
    setSkippedRows(0);
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        try {
          const { trades, skipped } = parseIbkrCsv(result.data);
          if (trades.length === 0) {
            setParseError(
              "No valid trades found. Make sure the CSV has Symbol, Date/Time, Quantity, Trade Price (or T. Price), and Buy/Sell columns.",
            );
            return;
          }
          setParsed(trades);
          setSkippedRows(skipped);
        } catch (e) {
          setParseError(e instanceof Error ? e.message : "Failed to parse CSV.");
        }
      },
      error: (err) => {
        setParseError(`Could not read CSV: ${err.message}`);
      },
    });
  }

  const previewRows = useMemo(() => parsed.slice(0, 5), [parsed]);

  function handleConfirm() {
    if (parsed.length === 0) return;
    importMutation.mutate({ data: { trades: parsed } });
  }

  function handleClose(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Trades from CSV</DialogTitle>
          <DialogDescription>
            Upload an Interactive Brokers CSV. Buy/Sell rows for the same symbol will
            be paired into round-trip trades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              data-testid="input-csv-file"
            />
          </div>

          {fileName && !parseError && parsed.length === 0 && (
            <p className="text-sm text-muted-foreground">Reading {fileName}…</p>
          )}

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not parse file</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {parsed.length > 0 && (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>
                  {parsed.length} trade{parsed.length === 1 ? "" : "s"} ready to import
                </AlertTitle>
                <AlertDescription>
                  Showing the first {previewRows.length} below.
                  {skippedRows > 0 &&
                    ` ${skippedRows} unpaired or invalid row${skippedRows === 1 ? "" : "s"} were skipped.`}
                </AlertDescription>
              </Alert>

              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead className="text-right">Entry</TableHead>
                      <TableHead className="text-right">Exit</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{t.symbol}</TableCell>
                        <TableCell>{t.direction}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {t.entryPrice}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {t.exitPrice}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {t.size}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(t.tradedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            data-testid="button-cancel-import"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={parsed.length === 0 || importMutation.isPending}
            data-testid="button-confirm-import"
          >
            <Upload className="h-4 w-4 mr-2" />
            {importMutation.isPending
              ? "Importing…"
              : `Import ${parsed.length || ""} trade${parsed.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
