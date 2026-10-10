-- CreateTable
CREATE TABLE "ItemVendors" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER,
    "VendorId" INTEGER,

    CONSTRAINT "ItemVendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnVendors" (
    "id" SERIAL NOT NULL,
    "YarnId" INTEGER,
    "VendorId" INTEGER,

    CONSTRAINT "YarnVendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricVendors" (
    "id" SERIAL NOT NULL,
    "fabricId" INTEGER,
    "VendorId" INTEGER,

    CONSTRAINT "FabricVendors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemVendors" ADD CONSTRAINT "ItemVendors_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVendors" ADD CONSTRAINT "ItemVendors_VendorId_fkey" FOREIGN KEY ("VendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnVendors" ADD CONSTRAINT "YarnVendors_YarnId_fkey" FOREIGN KEY ("YarnId") REFERENCES "Yarn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnVendors" ADD CONSTRAINT "YarnVendors_VendorId_fkey" FOREIGN KEY ("VendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricVendors" ADD CONSTRAINT "FabricVendors_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "Fabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricVendors" ADD CONSTRAINT "FabricVendors_VendorId_fkey" FOREIGN KEY ("VendorId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
