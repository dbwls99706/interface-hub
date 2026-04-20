import { cn } from "@/lib/utils";
import type { Protocol } from "@/lib/types/db";

const STYLES: Record<Protocol, string> = {
  REST: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  SOAP: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
  MQ: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  BATCH:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
  SFTP: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
};

export const ProtocolBadge = ({
  protocol,
  className,
}: {
  protocol: string;
  className?: string;
}) => {
  const style = STYLES[protocol as Protocol] ?? STYLES.BATCH;
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium tracking-wide",
        style,
        className,
      )}
    >
      {protocol}
    </span>
  );
};
