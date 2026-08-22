-- CreateTable
CREATE TABLE "ComicStrip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "panel1Url" TEXT NOT NULL,
    "panel2Url" TEXT NOT NULL,
    "panel3Url" TEXT NOT NULL,
    "panel4Url" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComicStrip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComicStrip_published_idx" ON "ComicStrip"("published");

-- CreateIndex
CREATE INDEX "ComicStrip_sortOrder_idx" ON "ComicStrip"("sortOrder");

INSERT INTO "ComicStrip" (
  "id",
  "title",
  "panel1Url",
  "panel2Url",
  "panel3Url",
  "panel4Url",
  "published",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  'yonkoma_ops_fee_001',
  '運用代、稼がなきゃ',
  '/brand/yonkoma-1.jpg',
  '/brand/yonkoma-2.jpg',
  '/brand/yonkoma-3.jpg',
  '/brand/yonkoma-4.jpg',
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
