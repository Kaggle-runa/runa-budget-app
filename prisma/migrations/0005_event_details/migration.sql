-- AlterTable
ALTER TABLE "Event" ADD COLUMN "body" TEXT;
ALTER TABLE "Event" ADD COLUMN "linkUrl" TEXT;
ALTER TABLE "Event" ADD COLUMN "announcementId" TEXT;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
