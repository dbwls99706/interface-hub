import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-dashed py-20 flex flex-col items-center text-center gap-3">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center">
        <SearchXIcon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <h2 className="font-medium">인터페이스를 찾을 수 없습니다</h2>
        <p className="text-sm text-muted-foreground mt-1">
          삭제되었거나 존재하지 않는 ID입니다.
        </p>
      </div>
      <Button variant="outline" render={<Link href="/interfaces" />}>
        목록으로
      </Button>
    </div>
  );
}
