-- CreateTable
CREATE TABLE "Interface" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interfaceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "request" TEXT,
    "response" TEXT,
    "retryOfId" TEXT,
    CONSTRAINT "Execution_interfaceId_fkey" FOREIGN KEY ("interfaceId") REFERENCES "Interface" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Execution_retryOfId_fkey" FOREIGN KEY ("retryOfId") REFERENCES "Execution" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecutionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExecutionLog_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Interface_protocol_idx" ON "Interface"("protocol");

-- CreateIndex
CREATE INDEX "Interface_isActive_idx" ON "Interface"("isActive");

-- CreateIndex
CREATE INDEX "Execution_interfaceId_startedAt_idx" ON "Execution"("interfaceId", "startedAt");

-- CreateIndex
CREATE INDEX "Execution_status_idx" ON "Execution"("status");

-- CreateIndex
CREATE INDEX "ExecutionLog_executionId_loggedAt_idx" ON "ExecutionLog"("executionId", "loggedAt");
