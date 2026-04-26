export function formatCurrency(value: number | undefined | null) {
  if (value === undefined || value === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: "always",
  }).format(value);
}

export function formatPercent(value: number | undefined | null) {
  if (value === undefined || value === null) return "0.0%";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function cnPnl(value: number | undefined | null) {
  if (!value) return "text-muted-foreground";
  return value > 0 ? "text-win" : value < 0 ? "text-loss" : "text-muted-foreground";
}
