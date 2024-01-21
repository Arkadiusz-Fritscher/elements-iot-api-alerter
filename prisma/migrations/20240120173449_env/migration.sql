-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "limitId" INTEGER;

-- CreateTable
CREATE TABLE "Limit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batteryMin" DOUBLE PRECISION,
    "iso1Min" DOUBLE PRECISION NOT NULL,
    "iso2Min" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Limit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Limit_name_key" ON "Limit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_name_key" ON "Settings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_limitId_fkey" FOREIGN KEY ("limitId") REFERENCES "Limit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
