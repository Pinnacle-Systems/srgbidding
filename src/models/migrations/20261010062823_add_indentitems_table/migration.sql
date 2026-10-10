-- CreateTable
CREATE TABLE "IndentItemVendors" (
    "id" SERIAL NOT NULL,
    "indentItemId" INTEGER,
    "vendorId" INTEGER,

    CONSTRAINT "IndentItemVendors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IndentItemVendors" ADD CONSTRAINT "IndentItemVendors_indentItemId_fkey" FOREIGN KEY ("indentItemId") REFERENCES "IndentItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItemVendors" ADD CONSTRAINT "IndentItemVendors_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
