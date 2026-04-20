"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  interfaceCreateSchema,
  interfaceUpdateSchema,
} from "@/lib/schemas/interface";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

const toFieldErrors = (
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map((p) => String(p)).join(".") || "_";
    if (!out[key]) out[key] = [];
    out[key].push(issue.message);
  }
  return out;
};

const readFormData = (formData: FormData) => ({
  name: (formData.get("name") ?? "").toString(),
  protocol: (formData.get("protocol") ?? "").toString(),
  endpoint: (formData.get("endpoint") ?? "").toString(),
  description:
    (formData.get("description") ?? "").toString().trim() || undefined,
  config: (formData.get("config") ?? "{}").toString(),
});

export const createInterface = async (
  formData: FormData,
): Promise<ActionResult<{ id: string }>> => {
  const parsed = interfaceCreateSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "입력값을 확인해주세요.",
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }
  try {
    const created = await prisma.interface.create({ data: parsed.data });
    revalidatePath("/interfaces");
    return { ok: true, data: { id: created.id } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "인터페이스 생성에 실패했습니다.",
    };
  }
};

export const updateInterface = async (
  id: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> => {
  const raw = readFormData(formData);
  const isActiveRaw = formData.get("isActive");
  const input: Record<string, unknown> = { ...raw };
  if (isActiveRaw !== null) {
    input.isActive = isActiveRaw === "true" || isActiveRaw === "on";
  }
  const parsed = interfaceUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "입력값을 확인해주세요.",
      fieldErrors: toFieldErrors(parsed.error.issues),
    };
  }
  try {
    await prisma.interface.update({ where: { id }, data: parsed.data });
    revalidatePath("/interfaces");
    revalidatePath(`/interfaces/${id}`);
    return { ok: true, data: { id } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "인터페이스 수정에 실패했습니다.",
    };
  }
};

export const deleteInterface = async (id: string): Promise<ActionResult> => {
  try {
    await prisma.interface.delete({ where: { id } });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "인터페이스 삭제에 실패했습니다.",
    };
  }
  revalidatePath("/interfaces");
  redirect("/interfaces");
};

export const toggleActive = async (
  id: string,
  nextValue: boolean,
): Promise<ActionResult> => {
  try {
    await prisma.interface.update({
      where: { id },
      data: { isActive: nextValue },
    });
    revalidatePath("/interfaces");
    revalidatePath(`/interfaces/${id}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "상태 변경에 실패했습니다.",
    };
  }
};
