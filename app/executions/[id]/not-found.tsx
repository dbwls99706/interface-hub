import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-dashed bg-card/40 py-16 flex flex-col items-center justify-center text-center gap-3">
      <h2 className="text-lg font-semibold">실행 이력을 찾을 수 없습니다</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        삭제되었거나 잘못된 ID일 수 있습니다.
      </p>
      <Button render={<Link href="/executions" />} className="mt-2">
        실행 이력 목록으로
      </Button>
    </div>
  );
}
