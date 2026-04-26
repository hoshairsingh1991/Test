import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CalendarDay, DayDetail, DeleteResponse, EquityPoint, ExecutionAnalysis, GetCalendarParams, GetDayDetailParams, GetEquityCurveParams, GetExecutionAnalysisParams, GetMetricsSummaryParams, GetPerformanceBySessionParams, GetPerformanceBySetupParams, GetWinLossParams, GroupedPerformance, HealthStatus, ImportTradesPayload, ImportTradesResult, ListTradesParams, MetricsSummary, Trade, TradeInput, UpdateTradeInput, WeeklyReview, WinLoss } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List trades for the current user with optional filters
 */
export declare const getListTradesUrl: (params?: ListTradesParams) => string;
export declare const listTrades: (params?: ListTradesParams, options?: RequestInit) => Promise<Trade[]>;
export declare const getListTradesQueryKey: (params?: ListTradesParams) => readonly ["/api/trades", ...ListTradesParams[]];
export declare const getListTradesQueryOptions: <TData = Awaited<ReturnType<typeof listTrades>>, TError = ErrorType<unknown>>(params?: ListTradesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTrades>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTrades>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTradesQueryResult = NonNullable<Awaited<ReturnType<typeof listTrades>>>;
export type ListTradesQueryError = ErrorType<unknown>;
/**
 * @summary List trades for the current user with optional filters
 */
export declare function useListTrades<TData = Awaited<ReturnType<typeof listTrades>>, TError = ErrorType<unknown>>(params?: ListTradesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTrades>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new trade
 */
export declare const getCreateTradeUrl: () => string;
export declare const createTrade: (tradeInput: TradeInput, options?: RequestInit) => Promise<Trade>;
export declare const getCreateTradeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTrade>>, TError, {
        data: BodyType<TradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTrade>>, TError, {
    data: BodyType<TradeInput>;
}, TContext>;
export type CreateTradeMutationResult = NonNullable<Awaited<ReturnType<typeof createTrade>>>;
export type CreateTradeMutationBody = BodyType<TradeInput>;
export type CreateTradeMutationError = ErrorType<unknown>;
/**
 * @summary Create a new trade
 */
export declare const useCreateTrade: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTrade>>, TError, {
        data: BodyType<TradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTrade>>, TError, {
    data: BodyType<TradeInput>;
}, TContext>;
/**
 * @summary Bulk import trades (e.g. from CSV)
 */
export declare const getImportTradesUrl: () => string;
export declare const importTrades: (importTradesPayload: ImportTradesPayload, options?: RequestInit) => Promise<ImportTradesResult>;
export declare const getImportTradesMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof importTrades>>, TError, {
        data: BodyType<ImportTradesPayload>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof importTrades>>, TError, {
    data: BodyType<ImportTradesPayload>;
}, TContext>;
export type ImportTradesMutationResult = NonNullable<Awaited<ReturnType<typeof importTrades>>>;
export type ImportTradesMutationBody = BodyType<ImportTradesPayload>;
export type ImportTradesMutationError = ErrorType<unknown>;
/**
 * @summary Bulk import trades (e.g. from CSV)
 */
export declare const useImportTrades: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof importTrades>>, TError, {
        data: BodyType<ImportTradesPayload>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof importTrades>>, TError, {
    data: BodyType<ImportTradesPayload>;
}, TContext>;
export declare const getGetTradeUrl: (id: string) => string;
export declare const getTrade: (id: string, options?: RequestInit) => Promise<Trade>;
export declare const getGetTradeQueryKey: (id: string) => readonly [`/api/trades/${string}`];
export declare const getGetTradeQueryOptions: <TData = Awaited<ReturnType<typeof getTrade>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrade>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrade>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTradeQueryResult = NonNullable<Awaited<ReturnType<typeof getTrade>>>;
export type GetTradeQueryError = ErrorType<unknown>;
export declare function useGetTrade<TData = Awaited<ReturnType<typeof getTrade>>, TError = ErrorType<unknown>>(id: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrade>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update an existing trade (recomputes PnL and R)
 */
export declare const getUpdateTradeUrl: (id: string) => string;
export declare const updateTrade: (id: string, updateTradeInput: UpdateTradeInput, options?: RequestInit) => Promise<Trade>;
export declare const getUpdateTradeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTrade>>, TError, {
        id: string;
        data: BodyType<UpdateTradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTrade>>, TError, {
    id: string;
    data: BodyType<UpdateTradeInput>;
}, TContext>;
export type UpdateTradeMutationResult = NonNullable<Awaited<ReturnType<typeof updateTrade>>>;
export type UpdateTradeMutationBody = BodyType<UpdateTradeInput>;
export type UpdateTradeMutationError = ErrorType<unknown>;
/**
 * @summary Update an existing trade (recomputes PnL and R)
 */
export declare const useUpdateTrade: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTrade>>, TError, {
        id: string;
        data: BodyType<UpdateTradeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTrade>>, TError, {
    id: string;
    data: BodyType<UpdateTradeInput>;
}, TContext>;
/**
 * @summary Soft-delete a trade (marks as deleted, excludes from analytics)
 */
export declare const getDeleteTradeUrl: (id: string) => string;
export declare const deleteTrade: (id: string, options?: RequestInit) => Promise<DeleteResponse>;
export declare const getDeleteTradeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTrade>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTrade>>, TError, {
    id: string;
}, TContext>;
export type DeleteTradeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTrade>>>;
export type DeleteTradeMutationError = ErrorType<unknown>;
/**
 * @summary Soft-delete a trade (marks as deleted, excludes from analytics)
 */
export declare const useDeleteTrade: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTrade>>, TError, {
        id: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTrade>>, TError, {
    id: string;
}, TContext>;
/**
 * @summary Aggregate metrics with previous-period comparison
 */
export declare const getGetMetricsSummaryUrl: (params?: GetMetricsSummaryParams) => string;
export declare const getMetricsSummary: (params?: GetMetricsSummaryParams, options?: RequestInit) => Promise<MetricsSummary>;
export declare const getGetMetricsSummaryQueryKey: (params?: GetMetricsSummaryParams) => readonly ["/api/metrics/summary", ...GetMetricsSummaryParams[]];
export declare const getGetMetricsSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getMetricsSummary>>, TError = ErrorType<unknown>>(params?: GetMetricsSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMetricsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMetricsSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMetricsSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getMetricsSummary>>>;
export type GetMetricsSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Aggregate metrics with previous-period comparison
 */
export declare function useGetMetricsSummary<TData = Awaited<ReturnType<typeof getMetricsSummary>>, TError = ErrorType<unknown>>(params?: GetMetricsSummaryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMetricsSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Cumulative PnL over time
 */
export declare const getGetEquityCurveUrl: (params?: GetEquityCurveParams) => string;
export declare const getEquityCurve: (params?: GetEquityCurveParams, options?: RequestInit) => Promise<EquityPoint[]>;
export declare const getGetEquityCurveQueryKey: (params?: GetEquityCurveParams) => readonly ["/api/metrics/equity-curve", ...GetEquityCurveParams[]];
export declare const getGetEquityCurveQueryOptions: <TData = Awaited<ReturnType<typeof getEquityCurve>>, TError = ErrorType<unknown>>(params?: GetEquityCurveParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEquityCurve>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEquityCurve>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEquityCurveQueryResult = NonNullable<Awaited<ReturnType<typeof getEquityCurve>>>;
export type GetEquityCurveQueryError = ErrorType<unknown>;
/**
 * @summary Cumulative PnL over time
 */
export declare function useGetEquityCurve<TData = Awaited<ReturnType<typeof getEquityCurve>>, TError = ErrorType<unknown>>(params?: GetEquityCurveParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEquityCurve>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetWinLossUrl: (params?: GetWinLossParams) => string;
export declare const getWinLoss: (params?: GetWinLossParams, options?: RequestInit) => Promise<WinLoss>;
export declare const getGetWinLossQueryKey: (params?: GetWinLossParams) => readonly ["/api/metrics/win-loss", ...GetWinLossParams[]];
export declare const getGetWinLossQueryOptions: <TData = Awaited<ReturnType<typeof getWinLoss>>, TError = ErrorType<unknown>>(params?: GetWinLossParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWinLoss>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWinLoss>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWinLossQueryResult = NonNullable<Awaited<ReturnType<typeof getWinLoss>>>;
export type GetWinLossQueryError = ErrorType<unknown>;
export declare function useGetWinLoss<TData = Awaited<ReturnType<typeof getWinLoss>>, TError = ErrorType<unknown>>(params?: GetWinLossParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWinLoss>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPerformanceBySetupUrl: (params?: GetPerformanceBySetupParams) => string;
export declare const getPerformanceBySetup: (params?: GetPerformanceBySetupParams, options?: RequestInit) => Promise<GroupedPerformance[]>;
export declare const getGetPerformanceBySetupQueryKey: (params?: GetPerformanceBySetupParams) => readonly ["/api/metrics/by-setup", ...GetPerformanceBySetupParams[]];
export declare const getGetPerformanceBySetupQueryOptions: <TData = Awaited<ReturnType<typeof getPerformanceBySetup>>, TError = ErrorType<unknown>>(params?: GetPerformanceBySetupParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPerformanceBySetup>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPerformanceBySetup>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPerformanceBySetupQueryResult = NonNullable<Awaited<ReturnType<typeof getPerformanceBySetup>>>;
export type GetPerformanceBySetupQueryError = ErrorType<unknown>;
export declare function useGetPerformanceBySetup<TData = Awaited<ReturnType<typeof getPerformanceBySetup>>, TError = ErrorType<unknown>>(params?: GetPerformanceBySetupParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPerformanceBySetup>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPerformanceBySessionUrl: (params?: GetPerformanceBySessionParams) => string;
export declare const getPerformanceBySession: (params?: GetPerformanceBySessionParams, options?: RequestInit) => Promise<GroupedPerformance[]>;
export declare const getGetPerformanceBySessionQueryKey: (params?: GetPerformanceBySessionParams) => readonly ["/api/metrics/by-session", ...GetPerformanceBySessionParams[]];
export declare const getGetPerformanceBySessionQueryOptions: <TData = Awaited<ReturnType<typeof getPerformanceBySession>>, TError = ErrorType<unknown>>(params?: GetPerformanceBySessionParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPerformanceBySession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPerformanceBySession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPerformanceBySessionQueryResult = NonNullable<Awaited<ReturnType<typeof getPerformanceBySession>>>;
export type GetPerformanceBySessionQueryError = ErrorType<unknown>;
export declare function useGetPerformanceBySession<TData = Awaited<ReturnType<typeof getPerformanceBySession>>, TError = ErrorType<unknown>>(params?: GetPerformanceBySessionParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPerformanceBySession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Daily PnL aggregates for a calendar month
 */
export declare const getGetCalendarUrl: (params?: GetCalendarParams) => string;
export declare const getCalendar: (params?: GetCalendarParams, options?: RequestInit) => Promise<CalendarDay[]>;
export declare const getGetCalendarQueryKey: (params?: GetCalendarParams) => readonly ["/api/metrics/calendar", ...GetCalendarParams[]];
export declare const getGetCalendarQueryOptions: <TData = Awaited<ReturnType<typeof getCalendar>>, TError = ErrorType<unknown>>(params?: GetCalendarParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCalendar>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCalendar>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCalendarQueryResult = NonNullable<Awaited<ReturnType<typeof getCalendar>>>;
export type GetCalendarQueryError = ErrorType<unknown>;
/**
 * @summary Daily PnL aggregates for a calendar month
 */
export declare function useGetCalendar<TData = Awaited<ReturnType<typeof getCalendar>>, TError = ErrorType<unknown>>(params?: GetCalendarParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCalendar>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Detailed stats for a single trading day
 */
export declare const getGetDayDetailUrl: (params: GetDayDetailParams) => string;
export declare const getDayDetail: (params: GetDayDetailParams, options?: RequestInit) => Promise<DayDetail>;
export declare const getGetDayDetailQueryKey: (params?: GetDayDetailParams) => readonly ["/api/metrics/day", ...GetDayDetailParams[]];
export declare const getGetDayDetailQueryOptions: <TData = Awaited<ReturnType<typeof getDayDetail>>, TError = ErrorType<unknown>>(params: GetDayDetailParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDayDetail>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDayDetail>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDayDetailQueryResult = NonNullable<Awaited<ReturnType<typeof getDayDetail>>>;
export type GetDayDetailQueryError = ErrorType<unknown>;
/**
 * @summary Detailed stats for a single trading day
 */
export declare function useGetDayDetail<TData = Awaited<ReturnType<typeof getDayDetail>>, TError = ErrorType<unknown>>(params: GetDayDetailParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDayDetail>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Compare EMA aligned vs not, A+ vs FOMO
 */
export declare const getGetExecutionAnalysisUrl: (params?: GetExecutionAnalysisParams) => string;
export declare const getExecutionAnalysis: (params?: GetExecutionAnalysisParams, options?: RequestInit) => Promise<ExecutionAnalysis>;
export declare const getGetExecutionAnalysisQueryKey: (params?: GetExecutionAnalysisParams) => readonly ["/api/analysis/execution", ...GetExecutionAnalysisParams[]];
export declare const getGetExecutionAnalysisQueryOptions: <TData = Awaited<ReturnType<typeof getExecutionAnalysis>>, TError = ErrorType<unknown>>(params?: GetExecutionAnalysisParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExecutionAnalysis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getExecutionAnalysis>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetExecutionAnalysisQueryResult = NonNullable<Awaited<ReturnType<typeof getExecutionAnalysis>>>;
export type GetExecutionAnalysisQueryError = ErrorType<unknown>;
/**
 * @summary Compare EMA aligned vs not, A+ vs FOMO
 */
export declare function useGetExecutionAnalysis<TData = Awaited<ReturnType<typeof getExecutionAnalysis>>, TError = ErrorType<unknown>>(params?: GetExecutionAnalysisParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getExecutionAnalysis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Weekly review insights
 */
export declare const getGetWeeklyReviewUrl: () => string;
export declare const getWeeklyReview: (options?: RequestInit) => Promise<WeeklyReview>;
export declare const getGetWeeklyReviewQueryKey: () => readonly ["/api/review/weekly"];
export declare const getGetWeeklyReviewQueryOptions: <TData = Awaited<ReturnType<typeof getWeeklyReview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeeklyReview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWeeklyReview>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWeeklyReviewQueryResult = NonNullable<Awaited<ReturnType<typeof getWeeklyReview>>>;
export type GetWeeklyReviewQueryError = ErrorType<unknown>;
/**
 * @summary Weekly review insights
 */
export declare function useGetWeeklyReview<TData = Awaited<ReturnType<typeof getWeeklyReview>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWeeklyReview>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map