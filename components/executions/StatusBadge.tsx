import { cn } from "@/lib/utils";
import type { ExecutionStatus } from "@/lib/types/db";

const STYLES: Record<ExecutionStatus, string> = {
  SUCCESS:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  FAILED:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  RUNNING:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30 animate-pulse",
  PENDING:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
  RETRIED:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
};

const LABELS: Record<ExecutionStatus, string> = {
  SUCCESS: "성공",
  FAILED: "실패",
  RUNNING: "실행 중",
  PENDING: "대기",
  RETRIED: "재실행됨",
};

export const StatusBadge = ({
  status,
  className,
}: {
  status: ExecutionStatus;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium tracking-wide",
      STYLES[status],
      className,
    )}
  >
    {LABELS[status]}
  </span>
);
