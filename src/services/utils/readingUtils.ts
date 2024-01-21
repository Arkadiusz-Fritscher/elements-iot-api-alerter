import { ReadingData } from "../../interfaces/ElementsResponse";

export const validateMeasurementDate = (reading: ReadingData) => {
  // logger.info(`Validating measurement date for reading ${reading.id} of device ${reading.device_id}`);

  const meas_timestamp = new Date(reading.data.meas_timestamp);
  const measured_at = new Date(reading.measured_at);

  const timeDifferenceInMilliseconds = Math.abs(measured_at.getTime() - meas_timestamp.getTime());
  const timeDifferenceInHours = timeDifferenceInMilliseconds / (1000 * 60 * 60);

  if (timeDifferenceInHours > 24) {
    return reading.measured_at;
  } else {
    return reading.data.meas_timestamp;
  }
};

export const removeIdenticalReadings = (readings: ReadingData[]) => {
  const uniqueReadings = readings.filter(
    (reading, index, self) =>
      index === self.findIndex((r) => r.data.meas_timestamp === reading.data.meas_timestamp)
  );

  return uniqueReadings;
};
