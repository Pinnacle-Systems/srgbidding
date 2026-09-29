/*
  Warnings:

  - You are about to drop the column `Priority` on the `Indent` table. All the data in the column will be lost.
  - You are about to drop the column `remark` on the `Indent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Indent" DROP COLUMN "Priority",
DROP COLUMN "remark",
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "IndentItems" ADD COLUMN     "millToId" INTEGER;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_millToId_fkey" FOREIGN KEY ("millToId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
