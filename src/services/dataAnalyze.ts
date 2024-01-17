"use strict";
import logger from "./useLogger";
import { Data, ReadingData } from "../interfaces/ElementsResponse";
import { getReadings } from "./dataAccess";
import { Prisma, PrismaClient, Reading } from "@prisma/client";
import {
  standardDeviation,
  mean,
  zScore,
  median,
  interquartileRange,
  medianAbsoluteDeviation,
  quantile,
} from "simple-statistics";

const prisma = new PrismaClient();

const removeOutliersFromReadings = (dataset: number[], factor: number = 1.5) => {
  const q1 = quantile(dataset, 0.25);
  const q3 = quantile(dataset, 0.75);
  const iqr = interquartileRange(dataset);
  const lowerBound = q1 - factor * iqr;
  const upperBound = q3 + factor * iqr;

  return dataset.filter((value) => value >= lowerBound && value <= upperBound);
};

export function extractDataValuesByKey(
  readings: Reading[],
  keysToExtract = ["iso1", "iso2", "loop1", "loop2"]
) {
  // const extractedValues: { [key in keyof CalcStatisticalValues]: number[] } = {};
  const extractedValues: Record<string, number[]> = {};

  for (const key of keysToExtract) {
    // Check if the key exists in the data array
    if (!readings.some((obj) => obj.hasOwnProperty(key))) {
      continue;
    }

    // @ts-ignore
    extractedValues[key] = readings.map((obj) => obj[key]);
    extractedValues[key] = removeOutliersFromReadings(extractedValues[key]);
  }

  return extractedValues;
}

const calculateStatisticalValues = (type: string, dataset: number[], deviceId: string) => {
  const result: { type: string; value: number; sampleSize: number; deviceId: string }[] = [];

  if (!dataset.length) {
    return result;
  }
  result.push({ type: `${type}_mean`, value: mean(dataset), sampleSize: dataset.length, deviceId });
  result.push({ type: `${type}_median`, value: median(dataset), sampleSize: dataset.length, deviceId });
  result.push({
    type: `${type}_standardDeviation`,
    value: standardDeviation(dataset),
    sampleSize: dataset.length,
    deviceId,
  });
  result.push({
    type: `${type}_medianAbsoluteDeviation`,
    value: medianAbsoluteDeviation(dataset),
    sampleSize: dataset.length,
    deviceId,
  });
  result.push({
    type: `${type}_interquartileRange`,
    value: interquartileRange(dataset),
    sampleSize: dataset.length,
    deviceId,
  });

  return result;
};

export async function main() {
  const devices = await prisma.device.findMany({
    select: {
      id: true,
      readings: {
        select: {
          iso1: true,
          loop1: true,
          iso2: true,
          loop2: true,
        },
      },
      statistics: {},
    },
  });
  if (!devices || !devices.length) {
    logger.warn("No devices found");
    return;
  }

  const result: any = [];

  devices.forEach((device) => {
    const readings = extractDataValuesByKey(device.readings as Reading[]);

    Object.entries(readings).forEach(([key, dataset]) => {
      const statisticalValues = calculateStatisticalValues(key, dataset, device.id);

      result.push(...statisticalValues);
    });
  });

  // console.log(result);

  const createdStatistics = await Promise.all(
    result.map((entry: { type: string; value: number; sampleSize: number; deviceId: string }) => {
      return prisma.statistics.upsert({
        where: {
          slug: `${entry.type}_${entry.deviceId}`,
        },
        create: {
          ...entry,
          slug: `${entry.type}_${entry.deviceId}`,
        },
        update: {
          value: entry.value,
          sampleSize: entry.sampleSize,
        },
      });
    })
  );

  console.log(createdStatistics);

  return;

  // await Promise.all(devices.map((device) => initiateDeviceStatistics(device.id)));
  // initiateDeviceStatistics("47d1e925-4ac1-47bb-85ae-eb612ef4e5aa");
}

export default main;
