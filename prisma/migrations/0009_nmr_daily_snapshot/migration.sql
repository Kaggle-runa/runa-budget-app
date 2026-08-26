-- CreateTable
CREATE TABLE "NmrDailySnapshot" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "nmrAmount" DOUBLE PRECISION NOT NULL,
    "yen" INTEGER NOT NULL,
    "usdPrice" DOUBLE PRECISION,
    "usdJpy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NmrDailySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NmrDailySnapshot_date_key" ON "NmrDailySnapshot"("date");
