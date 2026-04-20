"use client";

import Link from "next/link";
import useSWR from "swr";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { EyeIcon, InboxIcon, Loader2Icon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ProtocolBadge } from "@/components/interfaces/ProtocolBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDuration, isLiveStatus } from "./formatters";
import {
  listExecutions,
  type ListExecutionsParams,
  type ListExecutionsResult,
} from "@/lib/actions/executions-query";

export const ExecutionList = ({
  filters,
  initialData,
}: {
  filters: ListExecutionsParams;
  initialData?: ListExecutionsResult;
}) => {
  const swrKey = [
    "executions",
    filters.interfaceId ?? "",
    filters.status ?? "",
    filters.protocol ?? "",
  ];

  const { data, error, isLoading } = useSWR<ListExecutionsResult>(
    swrKey,
    () => listExecutions(filters),
    {
      fallbackData: initialData,
      refreshInterval: (latest) =>
        latest?.items.some((x) => isLiveStatus(x.status)) ? 3000 : 0,
      revalidateOnFocus: false,
    },
  );

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        실행 이력을 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="rounded-xl border bg-card p-12 flex items-center justify-center text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin mr-2" />
        불러오는 중...
      </div>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 py-16 flex flex-col items-center justify-center text-center gap-3">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <InboxIcon className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-medium">조건에 맞는 실행 이력이 없습니다</h2>
          <p className="text-sm text-muted-foreground mt-1">
            인터페이스 상세 페이지에서 실행 버튼으로 새 실행을 시작해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="pl-4 w-[180px]">시작 시각</TableHead>
              <TableHead>인터페이스</TableHead>
              <TableHead className="w-[110px]">상태</TableHead>
              <TableHead className="w-[100px]">소요시간</TableHead>
              <TableHead>에러</TableHead>
              <TableHead className="w-[80px] pr-4 text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id} className="group">
                <TableCell className="pl-4 py-3 text-xs text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger render={<span />}>
                      {formatDistanceToNow(it.startedAt, {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(it.startedAt, "yyyy-MM-dd HH:mm:ss")}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-0">
                    <Link
                      href={`/interfaces/${it.interfaceId}`}
                      className="font-medium hover:underline truncate"
                    >
                      {it.interfaceName}
                    </Link>
                    <ProtocolBadge protocol={it.protocol} />
                  </div>
                  {it.retryOfId && (
                    <Link
                      href={`/executions/${it.retryOfId}`}
                      className="text-[10px] text-muted-foreground hover:underline mt-0.5 block"
                    >
                      ↺ 원본 실행 보기
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={it.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDuration(it.durationMs)}
                </TableCell>
                <TableCell>
                  {it.errorMessage ? (
                    <span
                      className="block max-w-[280px] truncate text-xs text-destructive"
                      title={it.errorMessage}
                    >
                      {it.errorMessage}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="상세 보기"
                    render={<Link href={`/executions/${it.id}`} />}
                  >
                    <EyeIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
};
