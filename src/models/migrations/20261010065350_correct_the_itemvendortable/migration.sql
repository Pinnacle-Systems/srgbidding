-- AlterTable
ALTER TABLE "IndentItemVendors" ADD COLUMN     "label" TEXT,
ADD COLUMN     "value" INTEGER;

-- AddForeignKey
ALTER TABLE "IndentItemVendors" ADD CONSTRAINT "IndentItemVendors_value_fkey" FOREIGN KEY ("value") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
