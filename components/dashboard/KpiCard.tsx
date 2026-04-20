import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Accent = "default" | "success" | "warn" | "info";

const ACCENT: Record<Accent, string> = {
  default: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warn: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

export const KpiCard = ({
  label,
  value,
  hint,
  accent = "default",
  trailing,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: Accent;
  trailing?: React.ReactNode;
}) => (
  <Card>
    <CardContent className="pt-6 space-y-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("text-3xl font-semibold tracking-tight", ACCENT[accent])}>
        {value}
      </div>
      {hint && (
        <div className="text-xs text-muted-foreground">{hint}</div>
      )}
      {trailing && <div className="pt-1">{trailing}</div>}
    </CardContent>
  </Card>
);
