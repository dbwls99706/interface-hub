import type { Protocol, LogLevel } from "@/lib/types/db";

export type AdapterLog = {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
};

export type AdapterContext = {
  interfaceId: string;
  executionId: string;
  endpoint: string;
  config: Record<string, unknown>;
  signal: AbortSignal;
};

export type AdapterResult = {
  status: "SUCCESS" | "FAILED";
  request?: unknown;
  response?: unknown;
  errorMessage?: string;
  logs: AdapterLog[];
};

export type ConfigValidation =
  | { ok: true; config: Record<string, unknown> }
  | { ok: false; error: string };

export type InterfaceAdapter = {
  protocol: Protocol;
  validateConfig(config: unknown): ConfigValidation;
  execute(ctx: AdapterContext): Promise<AdapterResult>;
};
