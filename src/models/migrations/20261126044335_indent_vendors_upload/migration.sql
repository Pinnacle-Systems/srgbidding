-- CreateTable
CREATE TABLE "IndentVendorsUpload" (
    "id" SERIAL NOT NULL,
    "biddingIndentvendorsId" INTEGER NOT NULL,
    "vendorId" INTEGER,
    "price" DOUBLE PRECISION,
    "remarks" TEXT,
    "date" TIMESTAMP(3),
    "fileName" TEXT,
    "filePath" TEXT,

    CONSTRAINT "IndentVendorsUpload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IndentVendorsUpload" ADD CONSTRAINT "IndentVendorsUpload_biddingIndentvendorsId_fkey" FOREIGN KEY ("biddingIndentvendorsId") REFERENCES "BiddingIndentvendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentVendorsUpload" ADD CONSTRAINT "IndentVendorsUpload_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
