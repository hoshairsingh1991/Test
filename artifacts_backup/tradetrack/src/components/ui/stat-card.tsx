import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function StatCard({ title, value, subtitle, icon, className, valueClassName }: StatCardProps) {
  return (
    <div className={cn("p-6 rounded-xl border border-border bg-card flex flex-col justify-between hover-elevate transition-colors", className)}>
      <div className="flex items-center justify-between mb-4 text-muted-foreground">
        <h3 className="text-sm font-medium tracking-tight uppercase">{title}</h3>
        {icon && <div className="h-4 w-4 opacity-70">{icon}</div>}
      </div>
      <div>
        <div className={cn("text-2xl font-semibold tracking-tight", valueClassName)}>
          {value}
        </div>
        {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
  );
}
