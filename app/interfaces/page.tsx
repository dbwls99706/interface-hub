import Link from "next/link";
import { format } from "date-fns";
import { PlusIcon, InboxIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProtocolBadge } from "@/components/interfaces/ProtocolBadge";
import { ActiveToggle } from "@/components/interfaces/ActiveToggle";
import { RowActions } from "@/components/interfaces/RowActions";

export const dynamic = "force-dynamic";

export default async function InterfacesPage() {
  const interfaces = await prisma.interface.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">인터페이스</h1>
          <p className="text-sm text-muted-foreground mt-1">
            등록된 인터페이스를 관리하고 실행 상태를 확인합니다.
          </p>
        </div>
        <Button render={<Link href="/interfaces/new" />}>
          <PlusIcon />
          새 인터페이스
        </Button>
      </div>

      {interfaces.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">이름</TableHead>
                <TableHead>프로토콜</TableHead>
                <TableHead>엔드포인트</TableHead>
                <TableHead className="w-[90px]">활성</TableHead>
                <TableHead className="w-[140px]">생성일</TableHead>
                <TableHead className="w-[60px] pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interfaces.map((it) => (
                <TableRow key={it.id} className="group">
                  <TableCell className="pl-4 py-3">
                    <Link
                      href={`/interfaces/${it.id}`}
                      className="font-medium hover:underline"
                    >
                      {it.name}
                    </Link>
                    {it.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[340px]">
                        {it.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <ProtocolBadge protocol={it.protocol} />
                  </TableCell>
                  <TableCell>
                    <span
                      className="block max-w-[320px] truncate font-mono text-xs text-muted-foreground"
                      title={it.endpoint}
                    >
                      {it.endpoint}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ActiveToggle id={it.id} initial={it.isActive} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(it.createdAt, "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <RowActions id={it.id} name={it.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const EmptyState = () => (
  <div className="rounded-xl border border-dashed bg-card/40 py-16 flex flex-col items-center justify-center text-center gap-3">
    <div className="size-12 rounded-full bg-muted flex items-center justify-center">
      <InboxIcon className="size-5 text-muted-foreground" />
    </div>
    <div>
      <h2 className="font-medium">등록된 인터페이스가 없습니다</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        첫 인터페이스를 등록하고 외부 시스템과의 연동을 중앙에서 관리해보세요.
      </p>
    </div>
    <Button className="mt-2" render={<Link href="/interfaces/new" />}>
      <PlusIcon />
      새 인터페이스 등록
    </Button>
  </div>
);
