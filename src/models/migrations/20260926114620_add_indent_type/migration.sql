/*
  Warnings:

  - Added the required column `indentType` to the `Indent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Indent" ADD COLUMN     "approvedById" INTEGER,
ADD COLUMN     "indentType" TEXT NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN DEFAULT false,
ADD COLUMN     "status" TEXT DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "IndentItems" ADD COLUMN     "countsId" INTEGER,
ADD COLUMN     "fabricId" INTEGER,
ADD COLUMN     "yarnBlendId" INTEGER,
ADD COLUMN     "yarnId" INTEGER;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "Yarn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_yarnBlendId_fkey" FOREIGN KEY ("yarnBlendId") REFERENCES "YarnBlend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "Counts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
