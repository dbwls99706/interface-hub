import type { Protocol } from "@/lib/types/db";
import type { InterfaceAdapter } from "./types";

import { restAdapter } from "./rest";
import { soapAdapter } from "./soap";
import { mqAdapter } from "./mq";
import { batchAdapter } from "./batch";
import { sftpAdapter } from "./sftp";

const adapters: Record<Protocol, InterfaceAdapter> = {
  REST: restAdapter,
  SOAP: soapAdapter,
  MQ: mqAdapter,
  BATCH: batchAdapter,
  SFTP: sftpAdapter,
};

export const getAdapter = (protocol: Protocol): InterfaceAdapter => {
  const adapter = adapters[protocol];
  if (!adapter) {
    throw new Error(`지원하지 않는 프로토콜입니다: ${protocol}`);
  }
  return adapter;
};
