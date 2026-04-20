import {
  ExecutionStatus,
  Protocol,
  type ExecutionStatus as ExecutionStatusT,
  type Protocol as ProtocolT,
} from "@/lib/types/db";
import { listInterfaceOptions } from "@/lib/actions/executions-query";
import { Filters } from "@/components/executions/Filters";
import { ExecutionList } from "@/components/executions/ExecutionList";

export const dynamic = "force-dynamic";

const isStatus = (v: string | undefined): v is ExecutionStatusT =>
  !!v && (Object.values(ExecutionStatus) as string[]).includes(v);

const isProtocol = (v: string | undefined): v is ProtocolT =>
  !!v && (Object.values(Protocol) as string[]).includes(v);

export default async function ExecutionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const interfaceId =
    typeof sp.interfaceId === "string" ? sp.interfaceId : undefined;
  const statusRaw = typeof sp.status === "string" ? sp.status : undefined;
  const protocolRaw = typeof sp.protocol === "string" ? sp.protocol : undefined;
  const status = isStatus(statusRaw) ? statusRaw : undefined;
  const protocol = isProtocol(protocolRaw) ? protocolRaw : undefined;

  const filters = { interfaceId, status, protocol };
  const options = await listInterfaceOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">실행 이력</h1>
        <p className="text-sm text-muted-foreground mt-1">
          모든 인터페이스의 실행 이력을 한 곳에서 모니터링합니다.
        </p>
      </div>

      <Filters value={filters} options={options} />

      <ExecutionList filters={filters} />
    </div>
  );
}
