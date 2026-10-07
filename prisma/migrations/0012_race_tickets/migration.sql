-- CreateTable
CREATE TABLE "RaceTicket" (
    "id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "betType" TEXT NOT NULL,
    "selection" TEXT NOT NULL,
    "stakeYen" INTEGER NOT NULL,
    "hitStatus" TEXT NOT NULL,
    "payoutYen" INTEGER NOT NULL,
    "payoutTotalYen" INTEGER NOT NULL,
    "source" TEXT,
    "sourceEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceIdempotency" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "raceTicketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaceIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RaceTicket_ticket_identity_key" ON "RaceTicket"("sport", "date", "receiptNumber", "venue", "race", "betType", "selection");

-- CreateIndex
CREATE UNIQUE INDEX "RaceTicket_source_event_key" ON "RaceTicket"("source", "sourceEventId");

-- CreateIndex
CREATE INDEX "RaceTicket_date_idx" ON "RaceTicket"("date");

-- CreateIndex
CREATE INDEX "RaceTicket_sport_idx" ON "RaceTicket"("sport");

-- CreateIndex
CREATE UNIQUE INDEX "RaceIdempotency_key_tokenHash_key" ON "RaceIdempotency"("key", "tokenHash");

-- CreateIndex
CREATE INDEX "RaceIdempotency_raceTicketId_idx" ON "RaceIdempotency"("raceTicketId");
