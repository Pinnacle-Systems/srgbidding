-- AlterTable
ALTER TABLE "Bidding" ADD COLUMN     "bidDate" TEXT,
ADD COLUMN     "bidNo" TEXT,
ADD COLUMN     "closingDate" TIMESTAMP(3),
ADD COLUMN     "docId" TEXT,
ADD COLUMN     "queryDeadline" TIMESTAMP(3),
ADD COLUMN     "submissionDeadline" TIMESTAMP(3),
ADD COLUMN     "termsTemplate" TEXT;

-- AlterTable
ALTER TABLE "BiddingIndent" ADD COLUMN     "colorId" INTEGER,
ADD COLUMN     "countsId" INTEGER,
ADD COLUMN     "customData" JSONB,
ADD COLUMN     "fabricId" INTEGER,
ADD COLUMN     "gsmId" INTEGER,
ADD COLUMN     "hsnId" INTEGER,
ADD COLUMN     "indentId" INTEGER,
ADD COLUMN     "indentItemId" INTEGER,
ADD COLUMN     "indentType" TEXT,
ADD COLUMN     "itemGroupId" INTEGER,
ADD COLUMN     "itemId" INTEGER,
ADD COLUMN     "make" TEXT,
ADD COLUMN     "price" TEXT,
ADD COLUMN     "qty" TEXT,
ADD COLUMN     "sizeId" INTEGER,
ADD COLUMN     "uomId" INTEGER,
ADD COLUMN     "yarnBlendId" INTEGER,
ADD COLUMN     "yarnId" INTEGER;

-- AlterTable
ALTER TABLE "BiddingLots" ADD COLUMN     "lotNumber" TEXT;

-- CreateTable
CREATE TABLE "BiddingIndentvendors" (
    "id" SERIAL NOT NULL,
    "biddingIndentId" INTEGER,
    "vendorId" INTEGER,
    "status" TEXT,

    CONSTRAINT "BiddingIndentvendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiddingIndentChat" (
    "id" SERIAL NOT NULL,
    "biddingIndentId" INTEGER,

    CONSTRAINT "BiddingIndentChat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_indentId_fkey" FOREIGN KEY ("indentId") REFERENCES "Indent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_indentItemId_fkey" FOREIGN KEY ("indentItemId") REFERENCES "IndentItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "Yarn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_yarnBlendId_fkey" FOREIGN KEY ("yarnBlendId") REFERENCES "YarnBlend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "Counts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndentvendors" ADD CONSTRAINT "BiddingIndentvendors_biddingIndentId_fkey" FOREIGN KEY ("biddingIndentId") REFERENCES "BiddingIndent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndentvendors" ADD CONSTRAINT "BiddingIndentvendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndentChat" ADD CONSTRAINT "BiddingIndentChat_biddingIndentId_fkey" FOREIGN KEY ("biddingIndentId") REFERENCES "BiddingIndent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
