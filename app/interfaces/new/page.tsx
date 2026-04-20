import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { InterfaceForm } from "@/components/interfaces/InterfaceForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewInterfacePage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href="/interfaces"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="size-3.5" />
          목록으로
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-2">
          새 인터페이스
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          외부 시스템과 연동할 인터페이스 정보를 입력하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <InterfaceForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
