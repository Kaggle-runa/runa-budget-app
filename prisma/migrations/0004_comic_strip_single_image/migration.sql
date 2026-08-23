-- AlterTable
ALTER TABLE "ComicStrip" ADD COLUMN "imageUrl" TEXT;

UPDATE "ComicStrip"
SET "imageUrl" = CASE
  WHEN "panel1Url" LIKE '/brand/yonkoma-1.%' THEN '/brand/yonkoma-ops-fee.jpg'
  ELSE "panel1Url"
END;

ALTER TABLE "ComicStrip" ALTER COLUMN "imageUrl" SET NOT NULL;

ALTER TABLE "ComicStrip" DROP COLUMN "panel1Url",
DROP COLUMN "panel2Url",
DROP COLUMN "panel3Url",
DROP COLUMN "panel4Url";
