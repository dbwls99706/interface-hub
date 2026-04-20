import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProtocolBadge } from "@/components/interfaces/ProtocolBadge";
import { cn } from "@/lib/utils";
import type { TopFailingRow } from "@/lib/actions/dashboard-query";

export const TopFailingTable = ({
  rows,
}: {
  rows: TopFailingRow[];
}) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        실패가 누적된 인터페이스가 없습니다 🎉
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="pl-4">인터페이스</TableHead>
          <TableHead className="w-[80px]">프로토콜</TableHead>
          <TableHead className="w-[90px] text-right">실패율</TableHead>
          <TableHead className="w-[100px] pr-4 text-right">실패/전체</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const high = r.failureRate >= 0.3;
          return (
            <TableRow key={r.id}>
              <TableCell className="pl-4 py-2">
                <Link
                  href={`/interfaces/${r.id}`}
                  className="font-medium hover:underline truncate block max-w-[260px]"
                >
                  {r.name}
                </Link>
              </TableCell>
              <TableCell>
                <ProtocolBadge protocol={r.protocol} />
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-xs tabular-nums font-medium",
                  high && "text-destructive",
                )}
              >
                {(r.failureRate * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="pr-4 text-right text-xs text-muted-foreground tabular-nums">
                {r.failedCount} / {r.totalCount}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
