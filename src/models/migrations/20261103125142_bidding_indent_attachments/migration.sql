-- CreateTable
CREATE TABLE "BiddingIndentAttachments" (
    "id" SERIAL NOT NULL,
    "biddingIndentId" INTEGER,
    "date" TIMESTAMP(3),
    "name" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,

    CONSTRAINT "BiddingIndentAttachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BiddingIndentAttachments" ADD CONSTRAINT "BiddingIndentAttachments_biddingIndentId_fkey" FOREIGN KEY ("biddingIndentId") REFERENCES "BiddingIndent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
