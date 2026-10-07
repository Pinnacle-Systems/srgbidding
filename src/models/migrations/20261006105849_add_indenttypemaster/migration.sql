-- AlterTable
ALTER TABLE "Indent" ADD COLUMN     "customData" JSONB,
ADD COLUMN     "indentTypeMasterId" INTEGER;

-- CreateTable
CREATE TABLE "IndentTypeMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fieldSchema" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndentTypeMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IndentTypeMaster_name_key" ON "IndentTypeMaster"("name");

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_indentTypeMasterId_fkey" FOREIGN KEY ("indentTypeMasterId") REFERENCES "IndentTypeMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
