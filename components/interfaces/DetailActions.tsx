"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PencilIcon, PlayIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteInterface } from "@/lib/actions/interfaces";

export const DetailActions = ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(async () => {
      const result = await deleteInterface(id);
      if (result && result.ok === false) {
        toast.error(result.error);
        return;
      }
      toast.success("삭제되었습니다.");
    });
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<span />}>
            <Button variant="outline" size="sm" disabled>
              <PlayIcon />
              실행
            </Button>
          </TooltipTrigger>
          <TooltipContent>Phase 4에서 활성화됩니다.</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button variant="outline" size="sm" render={<Link href={`/interfaces/${id}/edit`} />}>
        <PencilIcon />
        수정
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2Icon />
        삭제
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>인터페이스를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{name}</span>
              {" 및 연결된 실행 이력/로그가 함께 삭제됩니다. 되돌릴 수 없습니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onDelete}
              disabled={isPending}
            >
              {isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
