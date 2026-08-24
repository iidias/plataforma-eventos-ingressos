-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gateEventId" TEXT,
ADD COLUMN     "gateExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_gateEventId_key" ON "User"("gateEventId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gateEventId_fkey" FOREIGN KEY ("gateEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

