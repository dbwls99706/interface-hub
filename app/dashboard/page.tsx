import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { TimeseriesChart } from "@/components/dashboard/TimeseriesChart";
import { ProtocolTable } from "@/components/dashboard/ProtocolTable";
import { TopFailingTable } from "@/components/dashboard/TopFailingTable";
import { RecentFailuresTable } from "@/components/dashboard/RecentFailuresTable";
import { formatDuration } from "@/components/executions/formatters";
import {
  getDashboardStats,
  type RangeHours,
} from "@/lib/actions/dashboard-query";

export const dynamic = "force-dynamic";

const fmt = new Intl.NumberFormat("ko-KR");

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const range: RangeHours = sp.range === "7d" ? 168 : 24;
  const stats = await getDashboardStats(range);
  const { summary, timeseries, protocolBreakdown, topFailingInterfaces, recentFailures } =
    stats;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            인터페이스 운영 현황을 한눈에 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant={range === 24 ? "default" : "outline"}
            size="sm"
            render={<Link href="/dashboard?range=24h" />}
          >
            최근 24시간
          </Button>
          <Button
            variant={range === 168 ? "default" : "outline"}
            size="sm"
            render={<Link href="/dashboard?range=7d" />}
          >
            최근 7일
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="전체 실행"
          value={fmt.format(summary.totalExecutions)}
          hint={`${range === 24 ? "최근 24시간" : "최근 7일"} 누적`}
        />
        <KpiCard
          label="성공률"
          value={`${(summary.successRate * 100).toFixed(1)}%`}
          accent="success"
          hint={`성공 ${fmt.format(summary.successCount)} / 실패 ${fmt.format(summary.failedCount)}`}
          trailing={<ProgressBar value={summary.successRate} />}
        />
        <KpiCard
          label="평균 소요시간"
          value={formatDuration(summary.avgDurationMs)}
          accent="info"
          hint="완료된 실행 평균"
        />
        <KpiCard
          label="실행 중"
          value={fmt.format(summary.runningCount)}
          accent={summary.runningCount > 0 ? "warn" : "default"}
          hint="RUNNING + PENDING"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>시간대별 실행 추이</CardTitle>
          <CardDescription>
            성공/실패 건수를 {range === 24 ? "1시간" : "1일"} 단위로 집계합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimeseriesChart data={timeseries} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>프로토콜별 현황</CardTitle>
            <CardDescription>
              프로토콜 단위 실행 결과를 비교합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 overflow-hidden">
            <ProtocolTable rows={protocolBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>실패율 Top 5</CardTitle>
            <CardDescription>
              최소 3회 이상 실행된 인터페이스 중 실패율이 높은 순.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 overflow-hidden">
            <TopFailingTable rows={topFailingInterfaces} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 실패 10건</CardTitle>
          <CardDescription>
            가장 최근 발생한 실패를 빠르게 점검합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentFailuresTable rows={recentFailures} />
        </CardContent>
      </Card>
    </div>
  );
}
