import { createMockAdapter } from "./mock";

const randomId = (): string =>
  `JOB-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

export const batchAdapter = createMockAdapter({
  protocol: "BATCH",
  minDelayMs: 1000,
  maxDelayMs: 5000,
  successRate: 0.8,
  steps: [
    { level: "INFO", message: "잡 파라미터 검증", atProgress: 0.1 },
    { level: "INFO", message: "잡 인스턴스 생성", atProgress: 0.3 },
    { level: "INFO", message: "스텝 실행", atProgress: 0.7 },
    { level: "INFO", message: "커밋", atProgress: 0.95 },
  ],
  errorMessages: [
    "잡 파라미터 오류",
    "스텝 실패",
    "DB 커밋 실패",
  ],
  sampleRequest: {
    jobName: "settlement-daily",
    params: { date: new Date().toISOString().slice(0, 10) },
  },
  sampleResponse: {
    jobId: randomId(),
    recordsProcessed: Math.floor(Math.random() * 100_000),
  },
});
