import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProtocolBadge } from "@/components/interfaces/ProtocolBadge";
import { ProgressBar } from "./ProgressBar";
import { formatDuration } from "@/components/executions/formatters";
import type { ProtocolBreakdownRow } from "@/lib/actions/dashboard-query";

const fmt = new Intl.NumberFormat("ko-KR");

export const ProtocolTable = ({
  rows,
}: {
  rows: ProtocolBreakdownRow[];
}) => (
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/40">
        <TableHead className="pl-4">프로토콜</TableHead>
        <TableHead className="text-right">총</TableHead>
        <TableHead className="text-right">성공</TableHead>
        <TableHead className="text-right">실패</TableHead>
        <TableHead className="text-right">평균</TableHead>
        <TableHead className="w-[120px] pr-4">성공률</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((r) => {
        const finished = r.successCount + r.failedCount;
        const rate = finished === 0 ? 0 : r.successCount / finished;
        return (
          <TableRow key={r.protocol}>
            <TableCell className="pl-4 py-2">
              <ProtocolBadge protocol={r.protocol} />
            </TableCell>
            <TableCell className="text-right text-xs">
              {fmt.format(r.count)}
            </TableCell>
            <TableCell className="text-right text-xs text-emerald-600 dark:text-emerald-400">
              {fmt.format(r.successCount)}
            </TableCell>
            <TableCell className="text-right text-xs text-red-600 dark:text-red-400">
              {fmt.format(r.failedCount)}
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {formatDuration(r.avgDurationMs)}
            </TableCell>
            <TableCell className="pr-4">
              <div className="flex items-center gap-2">
                <ProgressBar value={rate} className="flex-1" />
                <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">
                  {(rate * 100).toFixed(1)}%
                </span>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
