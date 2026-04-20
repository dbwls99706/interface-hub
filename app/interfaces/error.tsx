"use client";

import { useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterfacesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 py-16 flex flex-col items-center text-center gap-3">
      <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangleIcon className="size-5 text-destructive" />
      </div>
      <div>
        <h2 className="font-medium">페이지를 불러오지 못했습니다</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "알 수 없는 오류가 발생했습니다."}
        </p>
      </div>
      <Button variant="outline" onClick={() => reset()}>
        다시 시도
      </Button>
    </div>
  );
}
