import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useUpdateTrade,
  getListTradesQueryKey,
  getGetMetricsSummaryQueryKey,
  getGetEquityCurveQueryKey,
  getGetWinLossQueryKey,
  getGetPerformanceBySetupQueryKey,
  getGetPerformanceBySessionQueryKey,
  getGetExecutionAnalysisQueryKey,
  getGetWeeklyReviewQueryKey,
  getGetCalendarQueryKey,
  getGetDayDetailQueryKey,
  type Trade,
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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  entryPrice: z.coerce.number().positive("Must be positive"),
  exitPrice: z.coerce.number().positive("Must be positive"),
  size: z.coerce.number().positive("Must be positive"),
  direction: z.enum(["Long", "Short"]),
  tradedAt: z.string(),
  setupType: z.enum(["Pullback", "Breakout", "Reversal"]),
  session: z.enum(["London", "NY", "Asia"]),
  emaAlignment: z.boolean(),
  executionQuality: z.enum(["A+", "B", "FOMO"]),
  notes: z.string().optional(),
  screenshotUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

interface EditTradeDialogProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTradeDialog({ trade, open, onOpenChange }: EditTradeDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: "",
      entryPrice: 0,
      exitPrice: 0,
      size: 1,
      direction: "Long",
      tradedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      setupType: "Pullback",
      session: "NY",
      emaAlignment: true,
      executionQuality: "A+",
      notes: "",
      screenshotUrl: "",
    },
  });

  useEffect(() => {
    if (trade && open) {
      form.reset({
        symbol: trade.symbol,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        size: trade.size,
        direction: trade.direction as "Long" | "Short",
        tradedAt: format(new Date(trade.tradedAt), "yyyy-MM-dd'T'HH:mm"),
        setupType: trade.setupType as "Pullback" | "Breakout" | "Reversal",
        session: trade.session as "London" | "NY" | "Asia",
        emaAlignment: trade.emaAlignment,
        executionQuality: trade.executionQuality as "A+" | "B" | "FOMO",
        notes: trade.notes ?? "",
        screenshotUrl: trade.screenshotUrl ?? "",
      });
    }
  }, [trade, open, form]);

  const updateTrade = useUpdateTrade({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Trade updated",
          description: "Changes saved and analytics refreshed.",
        });
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMetricsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetEquityCurveQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWinLossQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySetupQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySessionQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetExecutionAnalysisQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklyReviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCalendarQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDayDetailQueryKey() });
        onOpenChange(false);
      },
      onError: () => {
        toast({
          title: "Failed to update trade",
          description: "Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  function onSubmit(data: TradeFormValues) {
    if (!trade) return;
    updateTrade.mutate({
      id: trade.id,
      data: {
        ...data,
        tradedAt: new Date(data.tradedAt).toISOString(),
        screenshotUrl: data.screenshotUrl || null,
        notes: data.notes || null,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
          <DialogDescription>
            Update trade details. PnL and R will be recalculated automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            data-testid="form-edit-trade"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-symbol" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tradedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} data-testid="input-edit-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00001"
                        {...field}
                        data-testid="input-edit-entry"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00001"
                        {...field}
                        data-testid="input-edit-exit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-direction">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Long">Long</SelectItem>
                        <SelectItem value="Short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        data-testid="input-edit-size"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="setupType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-setup">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pullback">Pullback</SelectItem>
                        <SelectItem value="Breakout">Breakout</SelectItem>
                        <SelectItem value="Reversal">Reversal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-session">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NY">NY</SelectItem>
                        <SelectItem value="London">London</SelectItem>
                        <SelectItem value="Asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="executionQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Execution Quality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-quality">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+ (Perfect)</SelectItem>
                        <SelectItem value="B">B (Acceptable)</SelectItem>
                        <SelectItem value="FOMO">FOMO / Impulsive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emaAlignment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-[58px] mt-[auto]">
                    <FormLabel className="text-sm">EMA Aligned</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-ema"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What went well? What went wrong?"
                      className="resize-none min-h-[80px]"
                      {...field}
                      data-testid="textarea-edit-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-edit-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateTrade.isPending}
                data-testid="button-edit-save"
              >
                {updateTrade.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
