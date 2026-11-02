-- AlterTable
ALTER TABLE "Indent" ALTER COLUMN "status" SET DEFAULT '';

-- AlterTable
ALTER TABLE "IndentItems" ADD COLUMN     "status" TEXT DEFAULT '';
