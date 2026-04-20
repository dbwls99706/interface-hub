import { cn } from "@/lib/utils";

export const ProgressBar = ({
  value,
  className,
  indicatorClassName,
}: {
  /** 0~1 */
  value: number;
  className?: string;
  indicatorClassName?: string;
}) => {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn(
        "h-1.5 w-full rounded-full bg-muted overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-emerald-500 transition-all",
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
