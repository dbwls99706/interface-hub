export const Protocol = {
  REST: "REST",
  SOAP: "SOAP",
  MQ: "MQ",
  BATCH: "BATCH",
  SFTP: "SFTP",
} as const;
export type Protocol = (typeof Protocol)[keyof typeof Protocol];

export const ExecutionStatus = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  RETRIED: "RETRIED",
} as const;
export type ExecutionStatus =
  (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

export const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export const parseJson = <T>(
  s: string | null | undefined,
  fallback: T,
): T => {
  if (s === null || s === undefined || s === "") return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
};

export const stringifyJson = (v: unknown): string => {
  try {
    return JSON.stringify(v ?? {});
  } catch {
    return "{}";
  }
};
