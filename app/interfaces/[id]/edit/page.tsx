import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InterfaceForm } from "@/components/interfaces/InterfaceForm";

export const dynamic = "force-dynamic";

export default async function EditInterfacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const item = await prisma.interface.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href={`/interfaces/${item.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-3.5" />
          상세로
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">
          인터페이스 수정
        </h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {item.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <InterfaceForm
            mode="edit"
            initialData={{
              id: item.id,
              name: item.name,
              protocol: item.protocol,
              endpoint: item.endpoint,
              description: item.description,
              config: item.config,
              isActive: item.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
