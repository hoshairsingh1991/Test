import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateTrade, getListTradesQueryKey, getGetMetricsSummaryQueryKey, getGetEquityCurveQueryKey, getGetWinLossQueryKey, getGetPerformanceBySetupQueryKey, getGetPerformanceBySessionQueryKey, getGetExecutionAnalysisQueryKey, getGetWeeklyReviewQueryKey } from "@workspace/api-client-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
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

export default function NewTrade() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createTrade = useCreateTrade({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Trade logged",
          description: "Your trade has been successfully recorded.",
        });
        
        // Invalidate all metrics
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMetricsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetEquityCurveQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWinLossQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySetupQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPerformanceBySessionQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetExecutionAnalysisQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklyReviewQueryKey() });
        
        setLocation("/trades");
      },
      onError: (error) => {
        toast({
          title: "Error logging trade",
          description: "There was a problem saving your trade.",
          variant: "destructive",
        });
      }
    }
  });

  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: localStorage.getItem("lastSymbol") || "",
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

  function onSubmit(data: TradeFormValues) {
    localStorage.setItem("lastSymbol", data.symbol);
    const formattedData = {
      ...data,
      tradedAt: new Date(data.tradedAt).toISOString(),
      screenshotUrl: data.screenshotUrl || undefined,
      notes: data.notes || undefined,
    };
    
    createTrade.mutate({ data: formattedData });
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Trade</h1>
          <p className="text-muted-foreground mt-2">Enter trade details accurately to maintain clean data.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-border bg-card">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="ES, NQ, EURUSD" {...field} autoFocus />
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
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <FormField
                  control={form.control}
                  name="entryPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.00001" placeholder="0.00" {...field} />
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
                        <Input type="number" step="0.00001" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
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
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-border bg-card">
              <FormField
                control={form.control}
                name="setupType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select setup" />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select session" />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate execution" />
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-[72px] mt-[auto]">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">EMA Alignment</FormLabel>
                      <div className="text-xs text-muted-foreground">With trend?</div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="p-6 rounded-xl border border-border bg-card space-y-6">
              <FormField
                control={form.control}
                name="screenshotUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screenshot URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What went well? What went wrong?" 
                        className="resize-none min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setLocation("/trades")}>Cancel</Button>
              <Button type="submit" disabled={createTrade.isPending} size="lg" className="w-full sm:w-auto px-8">
                {createTrade.isPending ? "Saving..." : "Log Trade"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppShell>
  );
}
