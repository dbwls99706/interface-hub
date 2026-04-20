import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";

import { getExecutionDetail } from "@/lib/actions/executions-query";
import { ExecutionDetailView } from "@/components/executions/ExecutionDetailView";
import { RetryButton } from "@/components/executions/RetryButton";

export const dynamic = "force-dynamic";

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getExecutionDetail(id);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/executions"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeftIcon className="size-3.5" />
            실행 이력
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">
            실행 상세
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {detail.execution.id}
          </p>
        </div>
        <RetryButton executionId={detail.execution.id} />
      </div>

      <ExecutionDetailView id={id} initialData={detail} />
    </div>
  );
}
