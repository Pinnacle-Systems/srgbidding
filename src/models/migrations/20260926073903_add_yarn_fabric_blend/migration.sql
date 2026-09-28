-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "code" TEXT;

-- CreateTable
CREATE TABLE "Yarn" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "code" TEXT,

    CONSTRAINT "Yarn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fabric" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "code" TEXT,

    CONSTRAINT "Fabric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnBlend" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "code" TEXT,

    CONSTRAINT "YarnBlend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counts" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "code" TEXT,

    CONSTRAINT "Counts_pkey" PRIMARY KEY ("id")
);
