import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { EyeIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProtocolBadge } from "@/components/interfaces/ProtocolBadge";
import type { RecentFailureRow } from "@/lib/actions/dashboard-query";

export const RecentFailuresTable = ({
  rows,
}: {
  rows: RecentFailureRow[];
}) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        이 기간 내 실패가 없습니다 🎉
      </div>
    );
  }
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="pl-4 w-[180px]">시각</TableHead>
            <TableHead>인터페이스</TableHead>
            <TableHead className="w-[80px]">프로토콜</TableHead>
            <TableHead>에러</TableHead>
            <TableHead className="w-[60px] pr-4 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell
                className="pl-4 py-2 text-xs text-muted-foreground"
                title={format(r.startedAt, "yyyy-MM-dd HH:mm:ss")}
              >
                {formatDistanceToNow(r.startedAt, {
                  addSuffix: true,
                  locale: ko,
                })}
              </TableCell>
              <TableCell className="font-medium truncate max-w-[240px]">
                {r.interfaceName}
              </TableCell>
              <TableCell>
                <ProtocolBadge protocol={r.protocol} />
              </TableCell>
              <TableCell>
                <span
                  className="block max-w-[320px] truncate text-xs text-destructive"
                  title={r.errorMessage ?? ""}
                >
                  {r.errorMessage ?? "—"}
                </span>
              </TableCell>
              <TableCell className="pr-4 text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="상세 보기"
                  render={<Link href={`/executions/${r.id}`} />}
                >
                  <EyeIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
