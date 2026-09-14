-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "source" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "sourceEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_source_event_key" ON "Transaction"("source", "sourceEventId");

-- CreateTable
CREATE TABLE "ApiIdempotency" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiIdempotency_key_tokenHash_key" ON "ApiIdempotency"("key", "tokenHash");

-- CreateIndex
CREATE INDEX "ApiIdempotency_transactionId_idx" ON "ApiIdempotency"("transactionId");
