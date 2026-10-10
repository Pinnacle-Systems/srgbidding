/*
  Warnings:

  - You are about to drop the column `VendorId` on the `FabricVendors` table. All the data in the column will be lost.
  - You are about to drop the column `VendorId` on the `ItemVendors` table. All the data in the column will be lost.
  - You are about to drop the column `VendorId` on the `YarnVendors` table. All the data in the column will be lost.
  - You are about to drop the column `YarnId` on the `YarnVendors` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FabricVendors" DROP CONSTRAINT "FabricVendors_VendorId_fkey";

-- DropForeignKey
ALTER TABLE "ItemVendors" DROP CONSTRAINT "ItemVendors_VendorId_fkey";

-- DropForeignKey
ALTER TABLE "YarnVendors" DROP CONSTRAINT "YarnVendors_VendorId_fkey";

-- DropForeignKey
ALTER TABLE "YarnVendors" DROP CONSTRAINT "YarnVendors_YarnId_fkey";

-- AlterTable
ALTER TABLE "FabricVendors" DROP COLUMN "VendorId",
ADD COLUMN     "vendorId" INTEGER;

-- AlterTable
ALTER TABLE "ItemVendors" DROP COLUMN "VendorId",
ADD COLUMN     "vendorId" INTEGER;

-- AlterTable
ALTER TABLE "YarnVendors" DROP COLUMN "VendorId",
DROP COLUMN "YarnId",
ADD COLUMN     "vendorId" INTEGER,
ADD COLUMN     "yarnId" INTEGER;

-- AddForeignKey
ALTER TABLE "ItemVendors" ADD CONSTRAINT "ItemVendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnVendors" ADD CONSTRAINT "YarnVendors_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "Yarn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnVendors" ADD CONSTRAINT "YarnVendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricVendors" ADD CONSTRAINT "FabricVendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
