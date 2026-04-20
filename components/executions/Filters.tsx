"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExecutionStatus,
  Protocol,
  type ExecutionStatus as ExecutionStatusT,
  type Protocol as ProtocolT,
} from "@/lib/types/db";
import type { InterfaceOption } from "@/lib/actions/executions-query";

const STATUSES: ExecutionStatusT[] = [
  ExecutionStatus.PENDING,
  ExecutionStatus.RUNNING,
  ExecutionStatus.SUCCESS,
  ExecutionStatus.FAILED,
  ExecutionStatus.RETRIED,
];

const PROTOCOLS: ProtocolT[] = [
  Protocol.REST,
  Protocol.SOAP,
  Protocol.MQ,
  Protocol.BATCH,
  Protocol.SFTP,
];

const ALL = "__all__";

export type FiltersValue = {
  interfaceId?: string;
  status?: ExecutionStatusT;
  protocol?: ProtocolT;
};

export const Filters = ({
  value,
  options,
}: {
  value: FiltersValue;
  options: InterfaceOption[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const update = (next: FiltersValue) => {
    const sp = new URLSearchParams();
    if (next.interfaceId) sp.set("interfaceId", next.interfaceId);
    if (next.status) sp.set("status", next.status);
    if (next.protocol) sp.set("protocol", next.protocol);
    const qs = sp.toString();
    startTransition(() => {
      router.push(qs ? `/executions?${qs}` : "/executions");
    });
  };

  const hasAny = !!(value.interfaceId || value.status || value.protocol);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={value.interfaceId ?? ALL}
        onValueChange={(v) =>
          update({
            ...value,
            interfaceId: v == null || v === ALL ? undefined : String(v),
          })
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="인터페이스" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>전체 인터페이스</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.status ?? ALL}
        onValueChange={(v) =>
          update({
            ...value,
            status:
              v == null || v === ALL ? undefined : (String(v) as ExecutionStatusT),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>전체 상태</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.protocol ?? ALL}
        onValueChange={(v) =>
          update({
            ...value,
            protocol:
              v == null || v === ALL ? undefined : (String(v) as ProtocolT),
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="프로토콜" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>전체 프로토콜</SelectItem>
          {PROTOCOLS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasAny && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({})}
          disabled={isPending}
        >
          <XIcon />
          필터 초기화
        </Button>
      )}
    </div>
  );
};
