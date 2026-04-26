import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar as CalendarIcon, Plus, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Link } from "wouter";

export type Timeframe = "day" | "week" | "month" | "year";

interface TopBarProps {
  timeframe: Timeframe;
  onTimeframeChange: (t: Timeframe) => void;
  date: Date;
  onDateChange: (d: Date) => void;
  onImport: () => void;
}

export function TopBar({
  timeframe,
  onTimeframeChange,
  date,
  onDateChange,
  onImport,
}: TopBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          value={timeframe}
          onValueChange={(v) => v && onTimeframeChange(v as Timeframe)}
          className="bg-card border border-border rounded-lg p-1"
        >
          <ToggleGroupItem
            value="day"
            className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            data-testid="timeframe-day"
          >
            Day
          </ToggleGroupItem>
          <ToggleGroupItem
            value="week"
            className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            data-testid="timeframe-week"
          >
            Week
          </ToggleGroupItem>
          <ToggleGroupItem
            value="month"
            className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            data-testid="timeframe-month"
          >
            Month
          </ToggleGroupItem>
          <ToggleGroupItem
            value="year"
            className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            data-testid="timeframe-year"
          >
            Year
          </ToggleGroupItem>
        </ToggleGroup>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="gap-2"
              data-testid="button-date-picker"
            >
              <CalendarIcon className="h-4 w-4" />
              {format(date, "MMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && onDateChange(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onImport}
          data-testid="button-import-csv-top"
        >
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Link href="/trades/new">
          <Button data-testid="button-add-trade-top">
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </Link>
      </div>
    </div>
  );
}
