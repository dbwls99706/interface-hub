import type { AdapterLog } from "./types";

export type AdapterLogger = {
  logs: AdapterLog[];
  debug: (message: string, metadata?: Record<string, unknown>) => void;
  info: (message: string, metadata?: Record<string, unknown>) => void;
  warn: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, metadata?: Record<string, unknown>) => void;
};

export const createLogger = (): AdapterLogger => {
  const logs: AdapterLog[] = [];
  const push =
    (level: AdapterLog["level"]) =>
    (message: string, metadata?: Record<string, unknown>) => {
      logs.push({ level, message, metadata });
    };
  return {
    logs,
    debug: push("DEBUG"),
    info: push("INFO"),
    warn: push("WARN"),
    error: push("ERROR"),
  };
};
