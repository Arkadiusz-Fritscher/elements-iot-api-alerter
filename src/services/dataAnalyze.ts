"use strict";
import logger from "./useLogger";
import { Data, ReadingData } from "../interfaces/ElementsResponse";
import { getReadings } from "./dataAccess";
import { Prisma, PrismaClient, Reading, StatisticValueName } from "@prisma/client";
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

const calculateStatisticalValues = (functionName: string, dataset: number[]) => {
  switch (functionName) {
    case "mean":
      return mean(dataset);
    case "median":
      return median(dataset);
    case "std":
      return standardDeviation(dataset);
    case "mad":
      return medianAbsoluteDeviation(dataset);
    case "iqr":
      return interquartileRange(dataset);
    default:
      return null;
  }
};

const createDeviceStatistics = async (readings: Reading[]) => {
  logger.info("Starting to create device statistics");
  const datasets = extractDataValuesByKey(readings);
  const statisticTypes = await prisma.statisticType.findMany();

  if (!statisticTypes || !statisticTypes.length) {
    logger.warn("No statistical types found");
    return;
  }

  const statistics: any[] = [];

  statisticTypes.forEach((statisticType) => {
    Object.keys(datasets).forEach((key) => {
      const dataset = datasets[key];
      const value = calculateStatisticalValues(statisticType.name, dataset);

      const statisticValue = {} as Prisma.StatisticValueUncheckedCreateInput;

      if (!value) {
        return;
      }

      statisticValue.value = value;
      statisticValue.typeId = statisticType.id;
      statisticValue.deviceId = readings[0].deviceId;
      statisticValue.name = key as StatisticValueName;

      if (key.includes("iso")) {
        statisticValue.unit = "kOhm";
      } else if (key.includes("loop")) {
        statisticValue.unit = "Ohm";
      } else {
        statisticValue.unit = "";
      }

      statistics.push(statisticValue);

      return statisticValue;
    });
  });

  // const statisticResults = Object.keys(datasets).forEach((key) => {
  //   console.log(key, datasets[key]);

  //   if (!result.hasOwnProperty(key)) {
  //     result[key] = {};
  //   }
  // });

  const results = await Promise.all(
    statistics.map((statistic) => prisma.statisticValue.create({ data: statistic }))
  );

  console.log(results);
};

const initiateDeviceStatistics = async (
  deviceId: Prisma.DeviceUncheckedCreateInput["id"],
  limit: number = 100
) => {
  try {
    if (!deviceId || deviceId.length < 5) {
      logger.warn("No deviceId provided");
      return;
    }

    const readings = await getReadings(deviceId, limit);

    if (!readings || !readings?.length) {
      logger.warn("No readings found");
      return;
    }

    createDeviceStatistics(readings);
  } catch (error) {
    logger.error(error);
  }
};

export async function main() {
  // const devices = await prisma.device.findMany();
  // if (!devices || !devices.length) {
  //   logger.warn("No devices found");
  //   return;
  // }
  // await Promise.all(devices.map((device) => initiateDeviceStatistics(device.id)));
  // initiateDeviceStatistics("47d1e925-4ac1-47bb-85ae-eb612ef4e5aa");
}

export default main;
