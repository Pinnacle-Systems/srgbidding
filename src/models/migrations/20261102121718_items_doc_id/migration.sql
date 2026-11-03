/*
  Warnings:

  - A unique constraint covering the columns `[itemsDocId]` on the table `IndentItems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemsDocId` to the `IndentItems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IndentItems" ADD COLUMN     "itemsDocId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "IndentItems_itemsDocId_key" ON "IndentItems"("itemsDocId");
