"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/adapters/registry";
import { createLogger } from "@/lib/adapters/_logger";
import {
  Protocol,
  parseJson,
  stringifyJson,
  type LogLevel,
} from "@/lib/types/db";
import type { InterfaceModel } from "@/lib/generated/prisma/models/Interface";
import type { ExecutionModel } from "@/lib/generated/prisma/models/Execution";
import type { AdapterLog } from "@/lib/adapters/types";

import type { ActionResult } from "./interfaces";

const EXECUTION_TIMEOUT_MS = 30_000;

const persistLogs = async (
  executionId: string,
  logs: AdapterLog[],
): Promise<void> => {
  if (logs.length === 0) return;
  try {
    await prisma.executionLog.createMany({
      data: logs.map((l) => ({
        executionId,
        level: l.level,
        message: l.message,
        metadata: l.metadata ? stringifyJson(l.metadata) : null,
      })),
    });
  } catch {
    // 로그 저장 실패는 본 흐름에 영향 주지 않음
  }
};

const finalizeFailed = async (
  execution: ExecutionModel,
  errorMessage: string,
  startedAt: Date,
  extraLog: AdapterLog,
): Promise<void> => {
  const finishedAt = new Date();
  await prisma.execution.update({
    where: { id: execution.id },
    data: {
      status: "FAILED",
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      errorMessage,
    },
  });
  await persistLogs(execution.id, [extraLog]);
};

const runExecution = async (
  execution: ExecutionModel,
  iface: InterfaceModel,
): Promise<void> => {
  const startedAt = new Date();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    EXECUTION_TIMEOUT_MS,
  );

  try {
    await prisma.execution.update({
      where: { id: execution.id },
      data: { status: "RUNNING", startedAt },
    });

    const adapter = getAdapter(iface.protocol as Protocol);
    const rawConfig = parseJson<Record<string, unknown>>(iface.config, {});
    const validation = adapter.validateConfig(rawConfig);

    if (!validation.ok) {
      const log = createLogger();
      log.error("config 검증 실패", { error: validation.error });
      await finalizeFailed(
        execution,
        validation.error,
        startedAt,
        log.logs[0]!,
      );
      return;
    }

    const result = await adapter.execute({
      interfaceId: iface.id,
      executionId: execution.id,
      endpoint: iface.endpoint,
      config: validation.config,
      signal: controller.signal,
    });

    const finishedAt = new Date();
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: result.status,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        errorMessage: result.errorMessage ?? null,
        request:
          result.request !== undefined ? stringifyJson(result.request) : null,
        response:
          result.response !== undefined ? stringifyJson(result.response) : null,
      },
    });
    await persistLogs(execution.id, result.logs);
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "실행 중 알 수 없는 오류 발생";
    const log: AdapterLog = {
      level: "ERROR" as LogLevel,
      message: "실행 엔진 예외",
      metadata: { errorMessage },
    };
    await finalizeFailed(execution, errorMessage, startedAt, log).catch(
      () => undefined,
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

export const executeInterface = async (
  interfaceId: string,
): Promise<ActionResult<{ executionId: string }>> => {
  let execution: ExecutionModel | null = null;
  try {
    const iface = await prisma.interface.findUnique({
      where: { id: interfaceId },
    });
    if (!iface) {
      return { ok: false, error: "인터페이스를 찾을 수 없습니다." };
    }
    if (!iface.isActive) {
      return {
        ok: false,
        error: "비활성 인터페이스는 실행할 수 없습니다.",
      };
    }

    execution = await prisma.execution.create({
      data: { interfaceId, status: "PENDING" },
    });

    await runExecution(execution, iface);

    revalidatePath(`/interfaces/${interfaceId}`);
    revalidatePath("/executions");

    return { ok: true, data: { executionId: execution.id } };
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "실행에 실패했습니다.";
    if (execution) {
      revalidatePath(`/interfaces/${interfaceId}`);
      revalidatePath("/executions");
      return { ok: true, data: { executionId: execution.id } };
    }
    return { ok: false, error: errorMessage };
  }
};

export const retryExecution = async (
  executionId: string,
): Promise<ActionResult<{ executionId: string }>> => {
  let newExecution: ExecutionModel | null = null;
  try {
    const original = await prisma.execution.findUnique({
      where: { id: executionId },
    });
    if (!original) {
      return { ok: false, error: "원본 실행 이력을 찾을 수 없습니다." };
    }

    const iface = await prisma.interface.findUnique({
      where: { id: original.interfaceId },
    });
    if (!iface) {
      return { ok: false, error: "인터페이스를 찾을 수 없습니다." };
    }
    if (!iface.isActive) {
      return {
        ok: false,
        error: "비활성 인터페이스는 실행할 수 없습니다.",
      };
    }

    newExecution = await prisma.execution.create({
      data: {
        interfaceId: iface.id,
        status: "PENDING",
        retryOfId: original.id,
      },
    });

    await runExecution(newExecution, iface);

    revalidatePath(`/interfaces/${iface.id}`);
    revalidatePath("/executions");
    revalidatePath(`/executions/${executionId}`);

    return { ok: true, data: { executionId: newExecution.id } };
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "재실행에 실패했습니다.";
    if (newExecution) {
      revalidatePath("/executions");
      return { ok: true, data: { executionId: newExecution.id } };
    }
    return { ok: false, error: errorMessage };
  }
};
