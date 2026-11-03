-- AlterTable
ALTER TABLE "User" ADD COLUMN     "partyId" INTEGER,
ADD COLUMN     "partyType" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
