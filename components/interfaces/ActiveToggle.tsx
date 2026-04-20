"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleActive } from "@/lib/actions/interfaces";

export const ActiveToggle = ({
  id,
  initial,
}: {
  id: string;
  initial: boolean;
}) => {
  const [active, setActive] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const onChange = (next: boolean) => {
    setActive(next);
    startTransition(async () => {
      const result = await toggleActive(id, next);
      if (!result.ok) {
        setActive(!next);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "활성화되었습니다." : "비활성화되었습니다.");
    });
  };

  return (
    <Switch
      checked={active}
      onCheckedChange={onChange}
      disabled={isPending}
      aria-label={active ? "활성" : "비활성"}
    />
  );
};
