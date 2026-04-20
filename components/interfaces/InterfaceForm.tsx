"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { interfaceCreateSchema } from "@/lib/schemas/interface";
import { Protocol } from "@/lib/types/db";
import {
  createInterface,
  updateInterface,
} from "@/lib/actions/interfaces";

type Mode = "create" | "edit";

type FormValues = z.infer<typeof interfaceCreateSchema>;

const PROTOCOLS: Protocol[] = [
  Protocol.REST,
  Protocol.SOAP,
  Protocol.MQ,
  Protocol.BATCH,
  Protocol.SFTP,
];

const ENDPOINT_PLACEHOLDER: Record<Protocol, string> = {
  REST: "https://api.example.com/v1/resource",
  SOAP: "https://partner.example.com/service.wsdl",
  MQ: "tcp://mq.example.com:1414/QUEUE.NAME",
  BATCH: "/batch/jobs/daily-settlement.sh",
  SFTP: "sftp://user@sftp.example.com/incoming",
};

const CONFIG_PLACEHOLDER: Record<Protocol, string> = {
  REST: `{
  "method": "POST",
  "headers": { "Content-Type": "application/json" },
  "timeoutMs": 5000
}`,
  SOAP: `{
  "soapAction": "urn:Example/Action",
  "namespace": "http://example.com/ns"
}`,
  MQ: `{
  "queueManager": "QM1",
  "channel": "SVR.CONN"
}`,
  BATCH: `{
  "schedule": "0 2 * * *",
  "args": []
}`,
  SFTP: `{
  "privateKeyPath": "/keys/id_rsa",
  "remotePath": "/incoming"
}`,
};

export type InterfaceFormInitial = {
  id: string;
  name: string;
  protocol: string;
  endpoint: string;
  description: string | null;
  config: string;
  isActive: boolean;
};

export const InterfaceForm = ({
  mode,
  initialData,
}: {
  mode: Mode;
  initialData?: InterfaceFormInitial;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(interfaceCreateSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      protocol: (initialData?.protocol as Protocol) ?? Protocol.REST,
      endpoint: initialData?.endpoint ?? "",
      description: initialData?.description ?? "",
      config: initialData?.config ?? "{}",
    },
  });

  const protocol = watch("protocol") as Protocol;

  const onSubmit = handleSubmit((values) => {
    const fd = new FormData();
    fd.set("name", values.name ?? "");
    fd.set("protocol", values.protocol ?? "");
    fd.set("endpoint", values.endpoint ?? "");
    fd.set("description", values.description ?? "");
    fd.set("config", values.config ?? "{}");

    startTransition(async () => {
      const result =
        mode === "edit" && initialData
          ? await updateInterface(initialData.id, fd)
          : await createInterface(fd);

      if (!result.ok) {
        toast.error(result.error);
        if (result.fieldErrors) {
          for (const [key, msgs] of Object.entries(result.fieldErrors)) {
            setError(key as keyof FormValues, {
              message: msgs[0] ?? "입력값을 확인해주세요.",
            });
          }
        }
        return;
      }
      toast.success(
        mode === "edit" ? "인터페이스를 수정했습니다." : "인터페이스를 생성했습니다.",
      );
      const destId = result.data?.id ?? initialData?.id;
      router.push(destId ? `/interfaces/${destId}` : "/interfaces");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          placeholder="예: 금감원 일일 거래 보고"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          <Label>프로토콜</Label>
          <Select
            value={protocol}
            onValueChange={(v) => setValue("protocol", v as Protocol)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROTOCOLS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.protocol && (
            <p className="text-xs text-destructive">
              {errors.protocol.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endpoint">엔드포인트</Label>
          <Input
            id="endpoint"
            placeholder={ENDPOINT_PLACEHOLDER[protocol]}
            {...register("endpoint")}
          />
          {errors.endpoint && (
            <p className="text-xs text-destructive">
              {errors.endpoint.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="이 인터페이스의 용도와 주의사항을 간단히 적어주세요."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="config">설정 (JSON)</Label>
        <Textarea
          id="config"
          rows={10}
          spellCheck={false}
          className="font-mono text-xs"
          placeholder={CONFIG_PLACEHOLDER[protocol]}
          {...register("config")}
        />
        {errors.config && (
          <p className="text-xs text-destructive">{errors.config.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "저장 중..."
            : mode === "edit"
              ? "수정 저장"
              : "인터페이스 생성"}
        </Button>
      </div>
    </form>
  );
};
