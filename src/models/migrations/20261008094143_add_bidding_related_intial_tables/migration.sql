-- CreateTable
CREATE TABLE "Bidding" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,

    CONSTRAINT "Bidding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiddingLots" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "status" TEXT DEFAULT 'PENDING',
    "biddingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiddingLots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiddingIndent" (
    "id" SERIAL NOT NULL,
    "biddingLotId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "BiddingIndent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bidding" ADD CONSTRAINT "Bidding_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bidding" ADD CONSTRAINT "Bidding_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bidding" ADD CONSTRAINT "Bidding_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingLots" ADD CONSTRAINT "BiddingLots_biddingId_fkey" FOREIGN KEY ("biddingId") REFERENCES "Bidding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiddingIndent" ADD CONSTRAINT "BiddingIndent_biddingLotId_fkey" FOREIGN KEY ("biddingLotId") REFERENCES "BiddingLots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
