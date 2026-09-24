-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "materialId" INTEGER;

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT false,
    "branchId" INTEGER,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indent" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "departmentId" INTEGER,
    "employeeId" INTEGER,
    "Priority" TEXT,
    "reason" TEXT,
    "remark" TEXT,
    "requiredDate" TIMESTAMP(3),

    CONSTRAINT "Indent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndentItems" (
    "id" SERIAL NOT NULL,
    "indentId" INTEGER,
    "itemGroupId" INTEGER,
    "itemId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "uomId" INTEGER,
    "hsnId" INTEGER,
    "gsmId" INTEGER,
    "price" TEXT,
    "qty" TEXT,

    CONSTRAINT "IndentItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_indentId_fkey" FOREIGN KEY ("indentId") REFERENCES "Indent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItems" ADD CONSTRAINT "IndentItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
