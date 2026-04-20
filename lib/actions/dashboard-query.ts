"use server";

import { prisma } from "@/lib/prisma";
import {
  Protocol,
  type Protocol as ProtocolT,
  type ExecutionStatus,
} from "@/lib/types/db";

export type RangeHours = 24 | 168;

export type TimeseriesBucket = {
  bucket: string;
  bucketStartAt: Date;
  success: number;
  failed: number;
  running: number;
};

export type ProtocolBreakdownRow = {
  protocol: ProtocolT;
  count: number;
  successCount: number;
  failedCount: number;
  avgDurationMs: number | null;
};

export type TopFailingRow = {
  id: string;
  name: string;
  protocol: ProtocolT;
  failedCount: number;
  totalCount: number;
  failureRate: number;
};

export type RecentFailureRow = {
  id: string;
  interfaceName: string;
  protocol: ProtocolT;
  startedAt: Date;
  errorMessage: string | null;
};

export type DashboardStats = {
  range: { hours: number; from: Date; to: Date };
  summary: {
    totalExecutions: number;
    successCount: number;
    failedCount: number;
    runningCount: number;
    successRate: number;
    avgDurationMs: number | null;
  };
  topFailingInterfaces: TopFailingRow[];
  protocolBreakdown: ProtocolBreakdownRow[];
  timeseries: TimeseriesBucket[];
  recentFailures: RecentFailureRow[];
};

const PROTOCOLS: ProtocolT[] = [
  Protocol.REST,
  Protocol.SOAP,
  Protocol.MQ,
  Protocol.BATCH,
  Protocol.SFTP,
];

const pad2 = (n: number): string => n.toString().padStart(2, "0");

const buildEmptyBuckets = (
  hours: number,
  to: Date,
): TimeseriesBucket[] => {
  if (hours === 24) {
    const buckets: TimeseriesBucket[] = [];
    const baseHour = new Date(to);
    baseHour.setMinutes(0, 0, 0);
    for (let i = 23; i >= 0; i -= 1) {
      const start = new Date(baseHour.getTime() - i * 3_600_000);
      buckets.push({
        bucket: `${pad2(start.getHours())}:00`,
        bucketStartAt: start,
        success: 0,
        failed: 0,
        running: 0,
      });
    }
    return buckets;
  }
  // 7일 = 일 단위 7개
  const buckets: TimeseriesBucket[] = [];
  const baseDay = new Date(to);
  baseDay.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i -= 1) {
    const start = new Date(baseDay.getTime() - i * 86_400_000);
    buckets.push({
      bucket: `${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`,
      bucketStartAt: start,
      success: 0,
      failed: 0,
      running: 0,
    });
  }
  return buckets;
};

const findBucketIndex = (
  buckets: TimeseriesBucket[],
  date: Date,
  hours: number,
): number => {
  if (buckets.length === 0) return -1;
  const start = buckets[0]!.bucketStartAt.getTime();
  const step = hours === 24 ? 3_600_000 : 86_400_000;
  const idx = Math.floor((date.getTime() - start) / step);
  if (idx < 0 || idx >= buckets.length) return -1;
  return idx;
};

export const getDashboardStats = async (
  rangeHours: RangeHours,
): Promise<DashboardStats> => {
  const to = new Date();
  const from = new Date(to.getTime() - rangeHours * 3_600_000);

  const rows = await prisma.execution.findMany({
    where: { startedAt: { gte: from } },
    include: {
      interface_: {
        select: { id: true, name: true, protocol: true },
      },
    },
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
  });

  // summary
  let successCount = 0;
  let failedCount = 0;
  let runningCount = 0;
  let durationSum = 0;
  let durationN = 0;
  for (const r of rows) {
    const s = r.status as ExecutionStatus;
    if (s === "SUCCESS") successCount += 1;
    else if (s === "FAILED") failedCount += 1;
    else if (s === "RUNNING" || s === "PENDING") runningCount += 1;
    if (r.durationMs !== null && r.durationMs !== undefined) {
      durationSum += r.durationMs;
      durationN += 1;
    }
  }
  const finishedTotal = successCount + failedCount;
  const successRate =
    finishedTotal === 0 ? 0 : successCount / finishedTotal;
  const avgDurationMs = durationN === 0 ? null : durationSum / durationN;

  // protocol breakdown
  const protocolMap = new Map<
    ProtocolT,
    { count: number; success: number; failed: number; durSum: number; durN: number }
  >();
  for (const p of PROTOCOLS) {
    protocolMap.set(p, {
      count: 0,
      success: 0,
      failed: 0,
      durSum: 0,
      durN: 0,
    });
  }
  for (const r of rows) {
    const p = r.interface_.protocol as ProtocolT;
    const slot = protocolMap.get(p);
    if (!slot) continue;
    slot.count += 1;
    const s = r.status as ExecutionStatus;
    if (s === "SUCCESS") slot.success += 1;
    else if (s === "FAILED") slot.failed += 1;
    if (r.durationMs !== null && r.durationMs !== undefined) {
      slot.durSum += r.durationMs;
      slot.durN += 1;
    }
  }
  const protocolBreakdown: ProtocolBreakdownRow[] = PROTOCOLS.map((p) => {
    const slot = protocolMap.get(p)!;
    return {
      protocol: p,
      count: slot.count,
      successCount: slot.success,
      failedCount: slot.failed,
      avgDurationMs: slot.durN === 0 ? null : slot.durSum / slot.durN,
    };
  });

  // top failing
  const ifaceMap = new Map<
    string,
    { name: string; protocol: ProtocolT; total: number; failed: number }
  >();
  for (const r of rows) {
    const id = r.interface_.id;
    const slot =
      ifaceMap.get(id) ??
      {
        name: r.interface_.name,
        protocol: r.interface_.protocol as ProtocolT,
        total: 0,
        failed: 0,
      };
    slot.total += 1;
    if ((r.status as ExecutionStatus) === "FAILED") slot.failed += 1;
    ifaceMap.set(id, slot);
  }
  const topFailingInterfaces: TopFailingRow[] = [...ifaceMap.entries()]
    .map(([id, v]) => ({
      id,
      name: v.name,
      protocol: v.protocol,
      failedCount: v.failed,
      totalCount: v.total,
      failureRate: v.total === 0 ? 0 : v.failed / v.total,
    }))
    .filter((x) => x.totalCount >= 3 && x.failedCount > 0)
    .sort((a, b) => b.failureRate - a.failureRate || b.failedCount - a.failedCount)
    .slice(0, 5);

  // timeseries
  const timeseries = buildEmptyBuckets(rangeHours, to);
  for (const r of rows) {
    const idx = findBucketIndex(timeseries, r.startedAt, rangeHours);
    if (idx < 0) continue;
    const slot = timeseries[idx]!;
    const s = r.status as ExecutionStatus;
    if (s === "SUCCESS") slot.success += 1;
    else if (s === "FAILED") slot.failed += 1;
    else if (s === "RUNNING" || s === "PENDING") slot.running += 1;
  }

  // recent failures
  const recentFailures: RecentFailureRow[] = rows
    .filter((r) => (r.status as ExecutionStatus) === "FAILED")
    .slice(0, 10)
    .map((r) => ({
      id: r.id,
      interfaceName: r.interface_.name,
      protocol: r.interface_.protocol as ProtocolT,
      startedAt: r.startedAt,
      errorMessage: r.errorMessage,
    }));

  return {
    range: { hours: rangeHours, from, to },
    summary: {
      totalExecutions: rows.length,
      successCount,
      failedCount,
      runningCount,
      successRate,
      avgDurationMs,
    },
    topFailingInterfaces,
    protocolBreakdown,
    timeseries,
    recentFailures,
  };
};
