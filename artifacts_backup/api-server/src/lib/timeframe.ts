export type Timeframe = "day" | "week" | "month" | "year" | "all";

export interface PeriodRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  timeframe: Timeframe;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const date = startOfDay(d);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setUTCDate(1);
  return x;
}

function startOfYear(d: Date): Date {
  const x = startOfDay(d);
  x.setUTCMonth(0, 1);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setUTCMonth(x.getUTCMonth() + months);
  return x;
}

function addYears(d: Date, years: number): Date {
  const x = new Date(d);
  x.setUTCFullYear(x.getUTCFullYear() + years);
  return x;
}

export function parseTimeframe(raw: unknown): Timeframe {
  if (
    raw === "day" ||
    raw === "week" ||
    raw === "month" ||
    raw === "year" ||
    raw === "all"
  ) {
    return raw;
  }
  return "month";
}

export function parseAnchor(raw: unknown): Date {
  if (typeof raw === "string" && raw.length > 0) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function periodRange(
  timeframe: Timeframe,
  anchor: Date,
): PeriodRange {
  let start: Date;
  let end: Date;
  let prevStart: Date;
  let prevEnd: Date;

  switch (timeframe) {
    case "day":
      start = startOfDay(anchor);
      end = addDays(start, 1);
      prevStart = addDays(start, -1);
      prevEnd = start;
      break;
    case "week":
      start = startOfWeek(anchor);
      end = addDays(start, 7);
      prevStart = addDays(start, -7);
      prevEnd = start;
      break;
    case "month":
      start = startOfMonth(anchor);
      end = addMonths(start, 1);
      prevStart = addMonths(start, -1);
      prevEnd = start;
      break;
    case "year":
      start = startOfYear(anchor);
      end = addYears(start, 1);
      prevStart = addYears(start, -1);
      prevEnd = start;
      break;
    case "all":
    default:
      start = new Date(0);
      end = new Date("9999-12-31T00:00:00Z");
      prevStart = new Date(0);
      prevEnd = new Date(0);
      break;
  }

  return { start, end, prevStart, prevEnd, timeframe };
}

export function inRange(d: Date, start: Date, end: Date): boolean {
  return d >= start && d < end;
}
