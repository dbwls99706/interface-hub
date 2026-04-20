"use server";

import { prisma } from "@/lib/prisma";
import {
  parseJson,
  type ExecutionStatus,
  type Protocol,
  type LogLevel,
} from "@/lib/types/db";

export type ExecutionListItem = {
  id: string;
  interfaceId: string;
  interfaceName: string;
  protocol: Protocol;
  status: ExecutionStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
  errorMessage: string | null;
  retryOfId: string | null;
};

export type ListExecutionsParams = {
  cursor?: string;
  limit?: number;
  interfaceId?: string;
  status?: ExecutionStatus;
  protocol?: Protocol;
};

export type ListExecutionsResult = {
  items: ExecutionListItem[];
  nextCursor: string | null;
};

export const listExecutions = async (
  params: ListExecutionsParams,
): Promise<ListExecutionsResult> => {
  const limit = Math.min(Math.max(params.limit ?? 30, 1), 100);

  const where: {
    interfaceId?: string;
    status?: ExecutionStatus;
    interface_?: { protocol: Protocol };
  } = {};
  if (params.interfaceId) where.interfaceId = params.interfaceId;
  if (params.status) where.status = params.status;
  if (params.protocol) where.interface_ = { protocol: params.protocol };

  const rows = await prisma.execution.findMany({
    where,
    include: {
      interface_: { select: { name: true, protocol: true } },
    },
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(params.cursor
      ? { cursor: { id: params.cursor }, skip: 1 }
      : {}),
  });

  const sliced = rows.slice(0, limit);
  const nextCursor =
    rows.length > limit ? (rows[limit]?.id ?? null) : null;

  const items: ExecutionListItem[] = sliced.map((r) => ({
    id: r.id,
    interfaceId: r.interfaceId,
    interfaceName: r.interface_.name,
    protocol: r.interface_.protocol as Protocol,
    status: r.status as ExecutionStatus,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt,
    durationMs: r.durationMs,
    errorMessage: r.errorMessage,
    retryOfId: r.retryOfId,
  }));

  return { items, nextCursor };
};

export type ExecutionDetailLog = {
  id: string;
  level: LogLevel;
  message: string;
  metadata: unknown;
  loggedAt: Date;
};

export type ExecutionDetail = {
  execution: {
    id: string;
    interfaceId: string;
    status: ExecutionStatus;
    startedAt: Date;
    finishedAt: Date | null;
    durationMs: number | null;
    errorMessage: string | null;
    request: unknown;
    response: unknown;
    retryOfId: string | null;
  };
  logs: ExecutionDetailLog[];
  interface: {
    id: string;
    name: string;
    protocol: Protocol;
    endpoint: string;
  };
};

export const getExecutionDetail = async (
  id: string,
): Promise<ExecutionDetail | null> => {
  const row = await prisma.execution.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { loggedAt: "asc" } },
      interface_: {
        select: { id: true, name: true, protocol: true, endpoint: true },
      },
    },
  });
  if (!row) return null;

  return {
    execution: {
      id: row.id,
      interfaceId: row.interfaceId,
      status: row.status as ExecutionStatus,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      durationMs: row.durationMs,
      errorMessage: row.errorMessage,
      request: parseJson<unknown>(row.request, null),
      response: parseJson<unknown>(row.response, null),
      retryOfId: row.retryOfId,
    },
    logs: row.logs.map((l) => ({
      id: l.id,
      level: l.level as LogLevel,
      message: l.message,
      metadata: parseJson<unknown>(l.metadata, null),
      loggedAt: l.loggedAt,
    })),
    interface: {
      id: row.interface_.id,
      name: row.interface_.name,
      protocol: row.interface_.protocol as Protocol,
      endpoint: row.interface_.endpoint,
    },
  };
};

export type InterfaceOption = { id: string; name: string };

export const listInterfaceOptions = async (): Promise<InterfaceOption[]> => {
  const rows = await prisma.interface.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return rows;
};
