"use client";

import Link from "next/link";
import useSWR from "swr";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProtocolBadge } from "@/components/interfaces/ProtocolBadge";
import { StatusBadge } from "./StatusBadge";
import { JsonBlock } from "./JsonBlock";
import { LogTimeline } from "./LogTimeline";
import { formatDuration, isLiveStatus } from "./formatters";
import {
  getExecutionDetail,
  type ExecutionDetail,
} from "@/lib/actions/executions-query";

export const ExecutionDetailView = ({
  id,
  initialData,
}: {
  id: string;
  initialData: ExecutionDetail;
}) => {
  const { data } = useSWR<ExecutionDetail | null>(
    ["exec", id],
    () => getExecutionDetail(id),
    {
      fallbackData: initialData,
      refreshInterval: (latest) =>
        latest && isLiveStatus(latest.execution.status) ? 3000 : 0,
      revalidateOnFocus: false,
    },
  );

  const detail = data ?? initialData;
  const { execution, logs, interface: iface } = detail;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>이 실행의 핵심 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <InfoRow
            label="인터페이스"
            value={
              <Link
                href={`/interfaces/${iface.id}`}
                className="font-medium hover:underline"
              >
                {iface.name}
              </Link>
            }
          />
          <InfoRow
            label="프로토콜"
            value={<ProtocolBadge protocol={iface.protocol} />}
          />
          <InfoRow
            label="엔드포인트"
            value={
              <span className="font-mono text-xs break-all">
                {iface.endpoint}
              </span>
            }
          />
          <Separator />
          <InfoRow
            label="상태"
            value={<StatusBadge status={execution.status} />}
          />
          <InfoRow
            label="시작"
            value={
              <span className="text-xs text-muted-foreground">
                {format(execution.startedAt, "yyyy-MM-dd HH:mm:ss.SSS")}
              </span>
            }
          />
          <InfoRow
            label="종료"
            value={
              <span className="text-xs text-muted-foreground">
                {execution.finishedAt
                  ? format(execution.finishedAt, "yyyy-MM-dd HH:mm:ss.SSS")
                  : "—"}
              </span>
            }
          />
          <InfoRow
            label="소요시간"
            value={
              <span className="text-xs text-muted-foreground">
                {formatDuration(execution.durationMs)}
              </span>
            }
          />
          {execution.errorMessage && (
            <>
              <Separator />
              <InfoRow
                label="에러"
                value={
                  <span className="text-xs text-destructive break-all">
                    {execution.errorMessage}
                  </span>
                }
              />
            </>
          )}
          {execution.retryOfId && (
            <InfoRow
              label="원본 실행"
              value={
                <Link
                  href={`/executions/${execution.retryOfId}`}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  {execution.retryOfId.slice(0, 12)}...
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="request">
        <TabsList>
          <TabsTrigger value="request">요청</TabsTrigger>
          <TabsTrigger value="response">응답</TabsTrigger>
          <TabsTrigger value="logs">로그 ({logs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="request">
          <Card>
            <CardContent className="pt-6">
              <JsonBlock value={execution.request} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="response">
          <Card>
            <CardContent className="pt-6">
              <JsonBlock value={execution.response} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardContent className="pt-6">
              <LogTimeline logs={logs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-[100px_1fr] items-start gap-3">
    <div className="text-xs uppercase tracking-wide text-muted-foreground pt-0.5">
      {label}
    </div>
    <div className="min-w-0">{value}</div>
  </div>
);
