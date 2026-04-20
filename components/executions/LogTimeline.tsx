"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangleIcon,
  BugIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InfoIcon,
  XCircleIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { LogLevel } from "@/lib/types/db";
import type { ExecutionDetailLog } from "@/lib/actions/executions-query";

const LEVEL_STYLE: Record<
  LogLevel,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  DEBUG: { icon: BugIcon, color: "text-slate-500 bg-slate-100 dark:bg-slate-500/20" },
  INFO: { icon: InfoIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-500/20" },
  WARN: {
    icon: AlertTriangleIcon,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-500/20",
  },
  ERROR: {
    icon: XCircleIcon,
    color: "text-red-600 bg-red-100 dark:bg-red-500/20",
  },
};

export const LogTimeline = ({ logs }: { logs: ExecutionDetailLog[] }) => {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        기록된 로그가 없습니다.
      </div>
    );
  }
  return (
    <ol className="relative space-y-3 pl-7 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
      {logs.map((log) => (
        <LogItem key={log.id} log={log} />
      ))}
    </ol>
  );
};

const LogItem = ({ log }: { log: ExecutionDetailLog }) => {
  const [open, setOpen] = useState(false);
  const { icon: Icon, color } = LEVEL_STYLE[log.level];
  const hasMetadata =
    log.metadata !== null &&
    log.metadata !== undefined &&
    !(typeof log.metadata === "object" &&
      log.metadata !== null &&
      Object.keys(log.metadata as Record<string, unknown>).length === 0);

  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-7 top-0.5 inline-flex size-6 items-center justify-center rounded-full",
          color,
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {log.level}
        </span>
        <span className="text-[11px] text-muted-foreground/80 font-mono">
          {format(log.loggedAt, "HH:mm:ss.SSS")}
        </span>
        <span className="text-sm">{log.message}</span>
      </div>
      {hasMetadata && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {open ? (
              <ChevronDownIcon className="size-3" />
            ) : (
              <ChevronRightIcon className="size-3" />
            )}
            metadata
          </button>
          {open && (
            <pre className="mt-1 text-[11px] overflow-auto bg-muted p-2 rounded font-mono">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          )}
        </div>
      )}
    </li>
  );
};
