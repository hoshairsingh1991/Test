export function computePnl(
  direction: string,
  entryPrice: number,
  exitPrice: number,
  size: number,
): number {
  const diff = direction === "Long" ? exitPrice - entryPrice : entryPrice - exitPrice;
  return Number((diff * size).toFixed(4));
}

// R-multiple based on price move: |exit-entry| / entry. Simple, deterministic.
export function computeRR(
  direction: string,
  entryPrice: number,
  exitPrice: number,
): number {
  if (entryPrice <= 0) return 0;
  const move =
    direction === "Long"
      ? (exitPrice - entryPrice) / entryPrice
      : (entryPrice - exitPrice) / entryPrice;
  // Express as multiple of a 1% baseline risk per trade.
  return Number((move * 100).toFixed(4));
}
