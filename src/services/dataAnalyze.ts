"use strict";
import { Data, ReadingData } from "../interfaces/ElementsResponse";
import { extractDataValuesByKey, reduceDataArray, ExtractDataValuesByKey } from "./utils";
import {
  standardDeviation,
  mean,
  zScore,
  median,
  interquartileRange,
  sampleCorrelation,
  medianAbsoluteDeviation,
  quantile,
} from "simple-statistics";

const { devices } = require("../../db/readings.json");

const removeOutliers = (dataset: any[]) => {
  const q1 = quantile(dataset, 0.25);
  const q3 = quantile(dataset, 0.75);
  const iqr = interquartileRange(dataset);
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return dataset.filter((value) => value >= lowerBound && value <= upperBound);
};

const calcStatisticalValues = (data: ExtractDataValuesByKey) => {
  const statistics = {
    correlations: {
      iso1_iso2: sampleCorrelation(data.iso1, data.iso2),
      loop1_loop2: sampleCorrelation(data.loop1, data.loop2),
      iso1_loop1: sampleCorrelation(data.iso1, data.loop1),
      iso1_loop2: sampleCorrelation(data.iso1, data.loop2),
      iso2_loop1: sampleCorrelation(data.iso2, data.loop1),
      iso2_loop2: sampleCorrelation(data.iso2, data.loop2),
    },
  } as any;

  Object.entries(data).forEach(([key, valueArray]: [string, any[]]) => {
    const filteredValues = removeOutliers(valueArray);

    statistics[key] = {
      mean: mean(filteredValues),
      median: median(filteredValues),
      medianAbsoluteDeviation: medianAbsoluteDeviation(filteredValues),
      standardDeviation: standardDeviation(filteredValues),
      quantile25: quantile(filteredValues, 0.25),
      quantile75: quantile(filteredValues, 0.75),
      interquartileRange: interquartileRange(filteredValues),
    };
  });

  return statistics;
};

export const getStatisticalValues = (readings: ReadingData[]) => {
  const data = devices.map((device: any) => {
    return {
      ...device,
      readings: device.readings.map((reading: any) => reading.data),
    };
  });

  const results = data.map((device: any) => {
    const dataToCalculate = extractDataValuesByKey(device.readings, ["iso1", "iso2", "loop1", "loop2"]);

    const statistics = calcStatisticalValues(dataToCalculate);

    return { device: device.name, ...statistics };
  });

  // console.log(dataToCalculate.iso1);
  console.log(results);
};
