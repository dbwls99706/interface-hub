import { createMockAdapter } from "./mock";

const randomId = (): string =>
  Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");

export const mqAdapter = createMockAdapter({
  protocol: "MQ",
  minDelayMs: 100,
  maxDelayMs: 800,
  successRate: 0.92,
  steps: [
    { level: "DEBUG", message: "브로커 연결", atProgress: 0.15 },
    { level: "DEBUG", message: "채널 오픈", atProgress: 0.4 },
    { level: "INFO", message: "큐 선언", atProgress: 0.65 },
    { level: "INFO", message: "메시지 발행", atProgress: 0.95 },
  ],
  errorMessages: [
    "브로커 연결 실패",
    "채널 타임아웃",
    "큐 접근 권한 없음",
  ],
  sampleRequest: {
    queue: "interface.hub.outbound",
    message: { type: "PING", payload: { ts: Date.now() } },
  },
  sampleResponse: {
    enqueued: true,
    messageId: randomId(),
  },
});
