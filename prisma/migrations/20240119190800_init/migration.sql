-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'ERROR', 'WARNING', 'INACTIVE', 'PENDING');

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3),
    "status" "DeviceStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "battery" DOUBLE PRECISION NOT NULL,
    "iso1" DOUBLE PRECISION NOT NULL,
    "iso2" DOUBLE PRECISION NOT NULL,
    "loop1" DOUBLE PRECISION NOT NULL,
    "loop2" DOUBLE PRECISION NOT NULL,
    "temp" INTEGER,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceStatistics" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "iso1Mean" DOUBLE PRECISION NOT NULL,
    "iso1Median" DOUBLE PRECISION NOT NULL,
    "iso1StdDev" DOUBLE PRECISION NOT NULL,
    "iso2Mean" DOUBLE PRECISION NOT NULL,
    "iso2Median" DOUBLE PRECISION NOT NULL,
    "iso2StdDev" DOUBLE PRECISION NOT NULL,
    "loop1Mean" DOUBLE PRECISION NOT NULL,
    "loop1Median" DOUBLE PRECISION NOT NULL,
    "loop1StdDev" DOUBLE PRECISION NOT NULL,
    "loop2Mean" DOUBLE PRECISION NOT NULL,
    "loop2Median" DOUBLE PRECISION NOT NULL,
    "loop2StdDev" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DeviceStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_slug_key" ON "Device"("slug");

-- CreateIndex
CREATE INDEX "Reading_deviceId_measuredAt_idx" ON "Reading"("deviceId", "measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceStatistics_deviceId_key" ON "DeviceStatistics"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceStatistics_deviceId_idx" ON "DeviceStatistics"("deviceId");

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceStatistics" ADD CONSTRAINT "DeviceStatistics_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
