import { z } from "zod";
import { Protocol } from "@/lib/types/db";

const protocolValues = [
  Protocol.REST,
  Protocol.SOAP,
  Protocol.MQ,
  Protocol.BATCH,
  Protocol.SFTP,
] as const;

export const interfaceCreateSchema = z.object({
  name: z.string().min(1).max(100),
  protocol: z.enum(protocolValues),
  endpoint: z.string().min(1).max(500),
  description: z.string().max(500).optional(),
  config: z.string().refine(
    (s) => {
      try {
        JSON.parse(s);
        return true;
      } catch {
        return false;
      }
    },
    { message: "config must be valid JSON string" },
  ),
});

export const interfaceUpdateSchema = interfaceCreateSchema
  .partial()
  .extend({ isActive: z.boolean().optional() });

export type InterfaceCreateInput = z.infer<typeof interfaceCreateSchema>;
export type InterfaceUpdateInput = z.infer<typeof interfaceUpdateSchema>;
