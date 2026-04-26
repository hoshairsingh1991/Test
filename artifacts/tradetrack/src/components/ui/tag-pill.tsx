import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type PillType = "setup" | "session" | "execution" | "ema";

interface TagPillProps {
  type: PillType;
  value: string;
  className?: string;
}

export function TagPill({ type, value, className }: TagPillProps) {
  const getVariants = () => {
    switch (type) {
      case "setup":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
      case "session":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20";
      case "execution":
        if (value === "A+") return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
        if (value === "FOMO") return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20";
      case "ema":
        return value === "Yes" 
          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80 border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Badge variant="outline" className={cn("font-mono text-xs px-2 py-0.5 rounded-sm transition-colors", getVariants(), className)}>
      {value}
    </Badge>
  );
}
