import { z } from "zod";

import { createLogger } from "./_logger";
import type {
  AdapterContext,
  AdapterResult,
  ConfigValidation,
  InterfaceAdapter,
} from "./types";

const restConfigSchema = z.object({
  method: z
    .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
    .default("GET"),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.unknown().optional(),
  timeoutMs: z.number().int().positive().max(120_000).default(10_000),
});

type RestConfig = z.infer<typeof restConfigSchema>;

const isJsonContentType = (ct: string | null): boolean =>
  !!ct && ct.toLowerCase().includes("application/json");

const headersToObject = (h: Headers): Record<string, string> => {
  const out: Record<string, string> = {};
  h.forEach((value, key) => {
    out[key] = value;
  });
  return out;
};

export const restAdapter: InterfaceAdapter = {
  protocol: "REST",

  validateConfig(config: unknown): ConfigValidation {
    const parsed = restConfigSchema.safeParse(config ?? {});
    if (!parsed.success) {
      const message =
        parsed.error.issues
          .map((i) => `${i.path.join(".") || "_"}: ${i.message}`)
          .join(", ") || "잘못된 REST 설정입니다.";
      return { ok: false, error: message };
    }
    return { ok: true, config: parsed.data as Record<string, unknown> };
  },

  async execute(ctx: AdapterContext): Promise<AdapterResult> {
    const log = createLogger();
    const cfg = ctx.config as RestConfig;

    // 외부 signal과 timeout 둘 다 처리
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (ctx.signal.aborted) controller.abort();
    else ctx.signal.addEventListener("abort", onAbort, { once: true });
    const timeoutId = setTimeout(() => controller.abort(), cfg.timeoutMs);

    const requestBody =
      cfg.body !== undefined && cfg.body !== null
        ? JSON.stringify(cfg.body)
        : undefined;
    const requestHeaders: Record<string, string> = {
      ...(requestBody ? { "content-type": "application/json" } : {}),
      ...(cfg.headers ?? {}),
    };

    const requestRecord = {
      method: cfg.method,
      headers: requestHeaders,
      body: cfg.body ?? null,
    };

    log.info("REST 요청 시작", {
      method: cfg.method,
      endpoint: ctx.endpoint,
      timeoutMs: cfg.timeoutMs,
    });

    try {
      const res = await fetch(ctx.endpoint, {
        method: cfg.method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });

      const ct = res.headers.get("content-type");
      const responseBody: unknown = isJsonContentType(ct)
        ? await res.json().catch(() => null)
        : await res.text();

      const responseRecord = {
        status: res.status,
        headers: headersToObject(res.headers),
        body: responseBody,
      };

      const ok = res.status >= 200 && res.status < 300;
      if (ok) {
        log.info("REST 응답 수신", { status: res.status });
        return {
          status: "SUCCESS",
          request: requestRecord,
          response: responseRecord,
          logs: log.logs,
        };
      }

      log.error("HTTP 에러 응답", { status: res.status });
      return {
        status: "FAILED",
        request: requestRecord,
        response: responseRecord,
        errorMessage: `HTTP ${res.status} ${res.statusText}`,
        logs: log.logs,
      };
    } catch (e) {
      const aborted =
        ctx.signal.aborted ||
        (e instanceof Error && e.name === "AbortError");
      const errorMessage = aborted
        ? "요청이 취소되었거나 타임아웃되었습니다."
        : e instanceof Error
          ? e.message
          : "알 수 없는 오류가 발생했습니다.";

      log.error("REST 요청 실패", { errorMessage });

      return {
        status: "FAILED",
        request: requestRecord,
        errorMessage,
        logs: log.logs,
      };
    } finally {
      clearTimeout(timeoutId);
      ctx.signal.removeEventListener("abort", onAbort);
    }
  },
};
