import "dotenv/config";

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

type Protocol = "REST" | "SOAP" | "MQ" | "BATCH" | "SFTP";
type Status = "SUCCESS" | "FAILED";
type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";

type SeedInterface = {
  id: string;
  name: string;
  protocol: Protocol;
  endpoint: string;
  description: string;
  config: Record<string, unknown>;
};

const INTERFACES: SeedInterface[] = [
  {
    id: "seed-fss-report",
    name: "금감원 일일 리포트 전송",
    protocol: "SFTP",
    endpoint: "sftp://fss.go.kr/inbound",
    description: "매 영업일 마감 후 금감원으로 일일 거래 리포트를 전송합니다.",
    config: { op: "upload", path: "/daily/report.csv" },
  },
  {
    id: "seed-krx-quote",
    name: "KRX 실시간 시세 조회",
    protocol: "REST",
    endpoint: "https://jsonplaceholder.typicode.com/posts/1",
    description: "거래소 실시간 시세 API로 종목 정보를 조회합니다.",
    config: { method: "GET", timeoutMs: 5000 },
  },
  {
    id: "seed-partner-mq",
    name: "제휴사 주문 발행",
    protocol: "MQ",
    endpoint: "amqp://partner.example.com",
    description: "제휴사 주문 처리 큐로 신규 주문 메시지를 발행합니다.",
    config: { queue: "orders", message: { type: "NEW" } },
  },
  {
    id: "seed-legacy-soap",
    name: "레거시 고객정보 조회",
    protocol: "SOAP",
    endpoint: "https://legacy.example.com/customer",
    description: "레거시 코어뱅킹의 고객 정보를 SOAP으로 조회합니다.",
    config: {
      action: "GetCustomer",
      envelope: "<soap:Envelope/>",
    },
  },
  {
    id: "seed-nightly-batch",
    name: "야간 정산 배치",
    protocol: "BATCH",
    endpoint: "batch://settlement",
    description: "매일 02시에 실행되는 일별 정산 배치 잡입니다.",
    config: {
      jobName: "nightly-settlement",
      params: { date: "AUTO" },
    },
  },
  {
    id: "seed-audit-rest",
    name: "감사 로그 송신",
    protocol: "REST",
    endpoint: "https://jsonplaceholder.typicode.com/posts",
    description: "감사 시스템으로 주요 이벤트 로그를 송신합니다.",
    config: { method: "POST", body: { event: "AUDIT" } },
  },
  {
    id: "seed-sftp-incoming",
    name: "외부기관 수신 파일 처리",
    protocol: "SFTP",
    endpoint: "sftp://incoming.example.com",
    description: "외부기관에서 업로드한 파일을 다운로드해 처리합니다.",
    config: { op: "download", path: "/outbox/*.csv" },
  },
  {
    id: "seed-notify-mq",
    name: "알림 메시지 발행",
    protocol: "MQ",
    endpoint: "amqp://notify.example.com",
    description: "고객 알림(SMS/푸시) 발송용 메시지를 발행합니다.",
    config: { queue: "notifications", message: { channel: "sms" } },
  },
];

const DURATION_RANGE: Record<Protocol, [number, number]> = {
  REST: [100, 800],
  SOAP: [300, 2000],
  MQ: [100, 800],
  BATCH: [1000, 5000],
  SFTP: [500, 2500],
};

const ERROR_MESSAGES: Record<Protocol, string[]> = {
  REST: ["HTTP 500 Internal Server Error", "HTTP 404 Not Found", "요청 타임아웃"],
  SOAP: ["Envelope 파싱 실패", "WSDL 응답 없음", "SOAP Fault 수신"],
  MQ: ["브로커 연결 실패", "채널 타임아웃", "큐 접근 권한 없음"],
  BATCH: ["잡 파라미터 오류", "스텝 실패", "DB 커밋 실패"],
  SFTP: ["Host key mismatch", "Permission denied", "Connection reset"],
};

const STEPS: Record<Protocol, string[]> = {
  REST: ["요청 빌드", "fetch 호출", "응답 수신", "JSON 파싱", "결과 반환"],
  SOAP: ["WSDL 조회", "Envelope 생성", "요청 전송", "응답 파싱", "결과 검증"],
  MQ: ["브로커 연결", "채널 오픈", "큐 선언", "메시지 발행"],
  BATCH: ["잡 파라미터 검증", "잡 인스턴스 생성", "스텝 실행", "커밋"],
  SFTP: ["SSH 핸드셰이크", "호스트 키 검증", "인증", "세션 오픈", "파일 전송"],
};

const SAMPLE_REQUEST: Record<Protocol, unknown> = {
  REST: {
    method: "GET",
    headers: { accept: "application/json" },
    body: null,
  },
  SOAP: {
    envelope: "<soap:Envelope><soap:Body/></soap:Envelope>",
    action: "urn:GetData",
  },
  MQ: { queue: "orders", message: { type: "NEW", id: 1 } },
  BATCH: { jobName: "nightly-settlement", params: { date: "AUTO" } },
  SFTP: { path: "/daily/report.csv", op: "upload" },
};

const SAMPLE_RESPONSE: Record<Protocol, unknown> = {
  REST: { status: 200, headers: {}, body: { ok: true } },
  SOAP: {
    status: 200,
    body: "<soap:Envelope><soap:Body><Result>OK</Result></soap:Body></soap:Envelope>",
  },
  MQ: { enqueued: true, messageId: "msg-001" },
  BATCH: { jobId: "JOB-001", recordsProcessed: 12345 },
  SFTP: { bytesTransferred: 1048576, checksum: "abc123" },
};

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)] as T;

type ExecRow = {
  id: string;
  interfaceId: string;
  status: Status;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  errorMessage: string | null;
  request: string;
  response: string | null;
};

type LogRow = {
  executionId: string;
  level: Level;
  message: string;
  metadata: string | null;
  loggedAt: Date;
};

const buildExecutionsFor = (
  iface: SeedInterface,
  startSeq: number,
): { execs: ExecRow[]; logs: LogRow[] } => {
  const count = randInt(5, 10);
  const execs: ExecRow[] = [];
  const logs: LogRow[] = [];
  const [minD, maxD] = DURATION_RANGE[iface.protocol];

  for (let i = 0; i < count; i += 1) {
    const startedAt = new Date(
      Date.now() - Math.random() * 30 * 86_400_000,
    );
    const durationMs = randInt(minD, maxD);
    const finishedAt = new Date(startedAt.getTime() + durationMs);
    const isSuccess = Math.random() < 0.85;
    const status: Status = isSuccess ? "SUCCESS" : "FAILED";
    const errorMessage = isSuccess
      ? null
      : pick(ERROR_MESSAGES[iface.protocol]);
    const id = `seed-exec-${startSeq + i}-${iface.id.slice(5)}`;

    execs.push({
      id,
      interfaceId: iface.id,
      status,
      startedAt,
      finishedAt,
      durationMs,
      errorMessage,
      request: JSON.stringify(SAMPLE_REQUEST[iface.protocol]),
      response: isSuccess
        ? JSON.stringify(SAMPLE_RESPONSE[iface.protocol])
        : null,
    });

    const stepCount = randInt(3, Math.min(5, STEPS[iface.protocol].length));
    const chosenSteps = STEPS[iface.protocol].slice(0, stepCount);
    chosenSteps.forEach((step, idx) => {
      const ratio = (idx + 1) / chosenSteps.length;
      logs.push({
        executionId: id,
        level: "INFO",
        message: step,
        metadata: null,
        loggedAt: new Date(startedAt.getTime() + durationMs * ratio * 0.8),
      });
    });
    if (!isSuccess) {
      logs.push({
        executionId: id,
        level: "ERROR",
        message: errorMessage ?? "실행 실패",
        metadata: JSON.stringify({ protocol: iface.protocol }),
        loggedAt: finishedAt,
      });
    }
  }

  return { execs, logs };
};

const main = async (): Promise<void> => {
  console.log("🌱 Seeding...");

  for (const iface of INTERFACES) {
    await prisma.interface.upsert({
      where: { id: iface.id },
      update: {},
      create: {
        id: iface.id,
        name: iface.name,
        protocol: iface.protocol,
        endpoint: iface.endpoint,
        description: iface.description,
        config: JSON.stringify(iface.config),
        isActive: true,
      },
    });
  }

  // 기존 시드 실행 이력 정리 (interface 자체는 유지)
  await prisma.execution.deleteMany({
    where: { interfaceId: { startsWith: "seed-" } },
  });

  let seq = 1;
  const allExecs: ExecRow[] = [];
  const allLogs: LogRow[] = [];
  for (const iface of INTERFACES) {
    const { execs, logs } = buildExecutionsFor(iface, seq);
    seq += execs.length;
    allExecs.push(...execs);
    allLogs.push(...logs);
  }

  await prisma.execution.createMany({ data: allExecs });
  await prisma.executionLog.createMany({ data: allLogs });

  console.log(
    `✅ Seeded ${INTERFACES.length} interfaces, ${allExecs.length} executions, ${allLogs.length} logs`,
  );
};

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
