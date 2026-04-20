import { createLogger } from "./_logger";
import type {
  AdapterContext,
  AdapterResult,
  ConfigValidation,
  InterfaceAdapter,
} from "./types";
import type { Protocol, LogLevel } from "@/lib/types/db";

export type MockStep = {
  level: LogLevel;
  message: string;
  /** 0~1 사이 진행률. 이 시점에 step 로그가 기록됨 */
  atProgress: number;
};

export type MockSpec = {
  protocol: Protocol;
  minDelayMs: number;
  maxDelayMs: number;
  /** 0~1, 1이면 항상 성공 */
  successRate: number;
  steps: MockStep[];
  errorMessages: string[];
  sampleRequest: unknown;
  sampleResponse: unknown;
};

const sleepUntil = (ms: number, signal: AbortSignal): Promise<boolean> =>
  new Promise((resolve) => {
    if (signal.aborted) {
      resolve(true);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (signal.aborted) {
        clearInterval(interval);
        resolve(true);
        return;
      }
      if (Date.now() - start >= ms) {
        clearInterval(interval);
        resolve(false);
      }
    }, 50);
  });

const pickRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)] as T;

export const createMockAdapter = (spec: MockSpec): InterfaceAdapter => ({
  protocol: spec.protocol,

  validateConfig(config: unknown): ConfigValidation {
    if (config === null || config === undefined) {
      return { ok: true, config: {} };
    }
    if (typeof config !== "object" || Array.isArray(config)) {
      return { ok: false, error: "config는 객체여야 합니다." };
    }
    return { ok: true, config: config as Record<string, unknown> };
  },

  async execute(ctx: AdapterContext): Promise<AdapterResult> {
    const log = createLogger();
    const totalDelay =
      spec.minDelayMs +
      Math.floor(Math.random() * Math.max(1, spec.maxDelayMs - spec.minDelayMs));

    log.info(`${spec.protocol} 실행 시작`, {
      endpoint: ctx.endpoint,
      estimatedMs: totalDelay,
    });

    const sortedSteps = [...spec.steps].sort(
      (a, b) => a.atProgress - b.atProgress,
    );

    let elapsed = 0;
    for (const step of sortedSteps) {
      const target = Math.floor(totalDelay * step.atProgress);
      const wait = Math.max(0, target - elapsed);
      const aborted = await sleepUntil(wait, ctx.signal);
      if (aborted) {
        log.warn("실행 취소 감지", { stage: step.message });
        return {
          status: "FAILED",
          request: spec.sampleRequest,
          errorMessage: "실행이 취소되었습니다.",
          logs: log.logs,
        };
      }
      elapsed = target;
      log.logs.push({ level: step.level, message: step.message });
    }

    // 마지막 step 이후 남은 시간 소진
    const remaining = Math.max(0, totalDelay - elapsed);
    if (remaining > 0) {
      const aborted = await sleepUntil(remaining, ctx.signal);
      if (aborted) {
        return {
          status: "FAILED",
          request: spec.sampleRequest,
          errorMessage: "실행이 취소되었습니다.",
          logs: log.logs,
        };
      }
    }

    if (Math.random() < spec.successRate) {
      log.info(`${spec.protocol} 실행 성공`);
      return {
        status: "SUCCESS",
        request: spec.sampleRequest,
        response: spec.sampleResponse,
        logs: log.logs,
      };
    }

    const errorMessage = pickRandom(spec.errorMessages);
    log.error(`${spec.protocol} 실행 실패`, { errorMessage });
    return {
      status: "FAILED",
      request: spec.sampleRequest,
      errorMessage,
      logs: log.logs,
    };
  },
});
