"use strict";
import logger from "./loggerModule";
import { Device, Prisma, PrismaClient, Reading, DeviceStatus } from "@prisma/client";
import { statisticUtils } from "./utils";

const prisma = new PrismaClient();

export const updateDeviceStatistics = async (id: Device["id"]) => {
  try {
    logger.info(`Generating statistics for device ${id}`);
    const storedReadings = await prisma.reading.findMany({
      where: {
        deviceId: id,
        device: {
          status: DeviceStatus.ACTIVE,
        },
      },
      select: {
        iso1: true,
        iso2: true,
        loop1: true,
        loop2: true,
      },
    });

    if (!storedReadings.length) {
      logger.error(`Readings not found for device ${id}`);
      return;
    }

    const iso1 = statisticUtils.calculateStatistics(storedReadings.map((reading) => reading.iso1));
    const iso2 = statisticUtils.calculateStatistics(storedReadings.map((reading) => reading.iso2));
    const loop1 = statisticUtils.calculateStatistics(storedReadings.map((reading) => reading.loop1));
    const loop2 = statisticUtils.calculateStatistics(storedReadings.map((reading) => reading.loop2));

    logger.info(`Updating/Creating statistics for device ${id}`);
    const createdStatistics = await prisma.deviceStatistics.upsert({
      where: {
        deviceId: id,
      },
      update: {
        iso1Mean: iso1.mean,
        iso1Median: iso1.median,
        iso1StdDev: iso1.stdDev,
        iso2Mean: iso2.mean,
        iso2Median: iso2.median,
        iso2StdDev: iso2.stdDev,
        loop1Mean: loop1.mean,
        loop1Median: loop1.median,
        loop1StdDev: loop1.stdDev,
        loop2Mean: loop2.mean,
        loop2Median: loop2.median,
        loop2StdDev: loop2.stdDev,
      },
      create: {
        iso1Mean: iso1.mean,
        iso1Median: iso1.median,
        iso1StdDev: iso1.stdDev,
        iso2Mean: iso2.mean,
        iso2Median: iso2.median,
        iso2StdDev: iso2.stdDev,
        loop1Mean: loop1.mean,
        loop1Median: loop1.median,
        loop1StdDev: loop1.stdDev,
        loop2Mean: loop2.mean,
        loop2Median: loop2.median,
        loop2StdDev: loop2.stdDev,
        deviceId: id,
      },
    });

    logger.info(`Statistics for device ${id} updated/created`);

    console.log(createdStatistics);

    return createdStatistics;
  } catch (error) {
    logger.error(`Error while updating statistics for device ${id}: ${error}`);
  }
};
