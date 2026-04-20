"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { retryExecution } from "@/lib/actions/executions";

export const RetryButton = ({ executionId }: { executionId: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    const toastId = toast.loading("재실행 중...");
    startTransition(async () => {
      const result = await retryExecution(executionId);
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      toast.dismiss(toastId);
      const newId = result.data?.executionId;
      if (newId) router.push(`/executions/${newId}`);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <RotateCwIcon />
      )}
      {isPending ? "재실행 중..." : "다시 실행"}
    </Button>
  );
};
