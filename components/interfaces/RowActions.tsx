"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  EyeIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteInterface } from "@/lib/actions/interfaces";
import { executeInterface } from "@/lib/actions/executions";

export const RowActions = ({ id, name }: { id: string; name: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [isExecuting, startExecute] = useTransition();

  const onDelete = () => {
    startDelete(async () => {
      const result = await deleteInterface(id);
      if (result && result.ok === false) {
        toast.error(result.error);
        return;
      }
      toast.success("삭제되었습니다.");
      setOpen(false);
    });
  };

  const onExecute = () => {
    const toastId = toast.loading("실행 중...");
    startExecute(async () => {
      const result = await executeInterface(id);
      if (!result.ok) {
        toast.error(result.error, { id: toastId });
        return;
      }
      toast.dismiss(toastId);
      const execId = result.data?.executionId;
      if (execId) router.push(`/executions/${execId}`);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="행 액션">
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/interfaces/${id}`} />}>
            <EyeIcon />
            상세 보기
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/interfaces/${id}/edit`} />}>
            <PencilIcon />
            수정
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExecute} disabled={isExecuting}>
            {isExecuting ? <Loader2Icon className="animate-spin" /> : <PlayIcon />}
            {isExecuting ? "실행 중..." : "실행"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpen(true)}
          >
            <Trash2Icon />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
