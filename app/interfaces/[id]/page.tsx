import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ChevronLeftIcon, HistoryIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProtocolBadge } from "@/components/interfaces/ProtocolBadge";
import { ActiveToggle } from "@/components/interfaces/ActiveToggle";
import { DetailActions } from "@/components/interfaces/DetailActions";
import { parseJson } from "@/lib/types/db";

export const dynamic = "force-dynamic";

export default async function InterfaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.interface.findUnique({ where: { id } });
  if (!item) notFound();

  const parsedConfig = parseJson<unknown>(item.config, {});
  const prettyConfig = JSON.stringify(parsedConfig, null, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/interfaces"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeftIcon className="size-3.5" />
            목록으로
          </Link>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight truncate">
              {item.name}
            </h1>
            <ProtocolBadge protocol={item.protocol} />
            <span
              className={
                "text-xs rounded-full border px-2 py-0.5 " +
                (item.isActive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
                  : "border-muted-foreground/30 bg-muted text-muted-foreground")
              }
            >
              {item.isActive ? "활성" : "비활성"}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              {item.description}
            </p>
          )}
        </div>
        <DetailActions id={item.id} name={item.name} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              등록된 인터페이스의 기본 속성입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InfoRow label="이름" value={item.name} />
            <InfoRow
              label="프로토콜"
              value={<ProtocolBadge protocol={item.protocol} />}
            />
            <InfoRow
              label="엔드포인트"
              value={
                <span className="font-mono text-xs break-all">
                  {item.endpoint}
                </span>
              }
            />
            <Separator />
            <InfoRow
              label="활성 상태"
              value={
                <div className="flex items-center gap-2">
                  <ActiveToggle id={item.id} initial={item.isActive} />
                  <span className="text-xs text-muted-foreground">
                    {item.isActive ? "호출 가능" : "호출 비활성화됨"}
                  </span>
                </div>
              }
            />
            <InfoRow
              label="생성일"
              value={
                <span className="text-xs text-muted-foreground">
                  {format(item.createdAt, "yyyy-MM-dd HH:mm:ss")}
                </span>
              }
            />
            <InfoRow
              label="수정일"
              value={
                <span className="text-xs text-muted-foreground">
                  {format(item.updatedAt, "yyyy-MM-dd HH:mm:ss")}
                </span>
              }
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>설정</CardTitle>
            <CardDescription>
              프로토콜별 동작을 제어하는 JSON 설정입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted/60 p-4 text-xs font-mono overflow-x-auto max-h-[420px]">
              {prettyConfig}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="size-4 text-muted-foreground" />
            최근 실행
          </CardTitle>
          <CardDescription>
            최근 10건의 실행 결과가 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed py-12 flex flex-col items-center text-center gap-2">
            <p className="text-sm text-muted-foreground">
              아직 실행 이력이 없습니다.
            </p>
            <p className="text-xs text-muted-foreground/80">
              실행 기능은 Phase 4에서 활성화됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
