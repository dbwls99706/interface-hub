import { createMockAdapter } from "./mock";

const randomHash = (): string =>
  Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

export const sftpAdapter = createMockAdapter({
  protocol: "SFTP",
  minDelayMs: 500,
  maxDelayMs: 2500,
  successRate: 0.88,
  steps: [
    { level: "DEBUG", message: "SSH 핸드셰이크", atProgress: 0.1 },
    { level: "DEBUG", message: "호스트 키 검증", atProgress: 0.25 },
    { level: "INFO", message: "인증 성공", atProgress: 0.45 },
    { level: "INFO", message: "세션 오픈", atProgress: 0.65 },
    { level: "INFO", message: "파일 전송", atProgress: 0.95 },
  ],
  errorMessages: [
    "Host key mismatch",
    "Permission denied",
    "Connection reset",
  ],
  sampleRequest: {
    path: "/upload/inbound/2026/04/data.csv",
    op: "PUT",
  },
  sampleResponse: {
    bytesTransferred: Math.floor(Math.random() * 10_000_000),
    checksum: randomHash(),
  },
});
