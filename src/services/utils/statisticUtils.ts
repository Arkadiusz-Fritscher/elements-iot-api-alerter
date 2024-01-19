'use strict';

import {
  standardDeviation,
  mean,
  median,
  interquartileRange,
  medianAbsoluteDeviation,
  quantile,
} from 'simple-statistics';

export const removeOutliersFromReadings = (dataset: number[], factor: number = 1.5) => {
  const q1 = quantile(dataset, 0.25);
  const q3 = quantile(dataset, 0.75);
  const iqr = interquartileRange(dataset);
  const lowerBound = q1 - factor * iqr;
  const upperBound = q3 + factor * iqr;

  return dataset.filter((value) => value >= lowerBound && value <= upperBound);
};

export const calculateStatistics = (dataset: number[]) => {
  const datasetWithoutOutliers = removeOutliersFromReadings(dataset);

  const meanValue = mean(datasetWithoutOutliers);
  const medianValue = median(datasetWithoutOutliers);
  const stdDev = standardDeviation(datasetWithoutOutliers);
  const mad = medianAbsoluteDeviation(datasetWithoutOutliers);

  return {
    mean: meanValue,
    median: medianValue,
    stdDev: stdDev,
    mad: mad,
  };
};
