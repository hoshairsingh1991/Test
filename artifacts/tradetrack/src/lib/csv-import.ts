export interface ParsedTrade {
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  size: number;
  direction: "Long" | "Short";
  tradedAt: string;
}

interface RawFill {
  symbol: string;
  date: Date;
  qty: number;
  price: number;
  side: "BUY" | "SELL";
}

const SYMBOL_KEYS = ["Symbol", "symbol", "Ticker", "ticker"];
const DATE_KEYS = ["Date/Time", "DateTime", "Date", "Time", "date/time"];
const QTY_KEYS = ["Quantity", "Qty", "quantity"];
const PRICE_KEYS = ["Trade Price", "T. Price", "Price", "TradePrice", "trade price"];
const SIDE_KEYS = ["Buy/Sell", "Side", "Action", "buy/sell"];

function pick(row: Record<string, string>, keys: string[]): string | undefined {
  for (const k of keys) {
    if (row[k] != null && row[k] !== "") return row[k];
  }
  // Case-insensitive fallback
  const lower = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]),
  );
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v != null && v !== "") return v;
  }
  return undefined;
}

function parseDate(raw: string): Date | null {
  // IBKR uses "YYYY-MM-DD, HH:MM:SS" or "YYYYMMDD;HHMMSS". Try both.
  const trimmed = raw.trim().replace(",", " ").replace(";", " ");
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;

  const m = trimmed.match(/^(\d{4})(\d{2})(\d{2})\s+(\d{2})(\d{2})(\d{2})$/);
  if (m) {
    return new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4]),
      Number(m[5]),
      Number(m[6]),
    );
  }
  return null;
}

function parseSide(raw: string): "BUY" | "SELL" | null {
  const v = raw.trim().toUpperCase();
  if (v === "BUY" || v === "BOT" || v === "B") return "BUY";
  if (v === "SELL" || v === "SLD" || v === "S") return "SELL";
  return null;
}

export function parseIbkrCsv(rows: Record<string, string>[]): {
  trades: ParsedTrade[];
  skipped: number;
} {
  const fills: RawFill[] = [];
  let skipped = 0;

  for (const row of rows) {
    const symbol = pick(row, SYMBOL_KEYS)?.trim();
    const dateRaw = pick(row, DATE_KEYS);
    const qtyRaw = pick(row, QTY_KEYS);
    const priceRaw = pick(row, PRICE_KEYS);
    const sideRaw = pick(row, SIDE_KEYS);

    if (!symbol || !dateRaw || !qtyRaw || !priceRaw || !sideRaw) {
      skipped += 1;
      continue;
    }

    const date = parseDate(dateRaw);
    const qty = Math.abs(Number(qtyRaw.replace(/,/g, "")));
    const price = Number(priceRaw.replace(/,/g, ""));
    const side = parseSide(sideRaw);

    if (!date || !isFinite(qty) || qty <= 0 || !isFinite(price) || price <= 0 || !side) {
      skipped += 1;
      continue;
    }

    fills.push({ symbol, date, qty, price, side });
  }

  // Group by symbol, then chronologically pair opening/closing fills FIFO.
  const bySymbol = new Map<string, RawFill[]>();
  for (const f of fills) {
    const list = bySymbol.get(f.symbol) ?? [];
    list.push(f);
    bySymbol.set(f.symbol, list);
  }

  const trades: ParsedTrade[] = [];

  for (const [symbol, list] of bySymbol.entries()) {
    list.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Position queue: positive = long lots, negative = short lots
    const open: { side: "BUY" | "SELL"; qty: number; price: number; date: Date }[] = [];

    for (const fill of list) {
      // Opposite side closes existing lots FIFO
      let remaining = fill.qty;

      while (
        remaining > 0 &&
        open.length > 0 &&
        open[0].side !== fill.side
      ) {
        const lot = open[0];
        const closeQty = Math.min(lot.qty, remaining);
        const direction: "Long" | "Short" = lot.side === "BUY" ? "Long" : "Short";
        trades.push({
          symbol,
          entryPrice: lot.price,
          exitPrice: fill.price,
          size: closeQty,
          direction,
          tradedAt: lot.date.toISOString(),
        });
        lot.qty -= closeQty;
        remaining -= closeQty;
        if (lot.qty === 0) open.shift();
      }

      if (remaining > 0) {
        open.push({ side: fill.side, qty: remaining, price: fill.price, date: fill.date });
      }
    }

    // Unpaired open lots are skipped (not yet closed)
    skipped += open.reduce((acc, l) => acc + (l.qty > 0 ? 1 : 0), 0);
  }

  return { trades, skipped };
}
