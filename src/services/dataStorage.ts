import { PrismaClient, Prisma } from "@prisma/client";
import { Device } from "elementiot-client/lib/models";
import { getDevices, getReadings } from "./dataAccess";
import { extractDataValuesByKey, reduceDataArray } from "./utils";
import {
  standardDeviation,
  mean,
  zScore,
  median,
  interquartileRange,
  sampleCorrelation,
} from "simple-statistics";

const prisma = new PrismaClient();

/**
 * Removes the devices that already stored.
 *
 * @param devices - The devices to be removed.
 * @returns The updated list of devices after removal.
 */
const removeStoredDevices = async (devices: Device[]) => {
  const deviceIds = devices.map((device) => device.id);

  const storedDevices = await prisma.device.findMany({
    where: {
      id: {
        in: deviceIds,
      },
    },
  });

  if (storedDevices.length === 0) {
    return devices;
  }

  const newDevices = devices.reduce((acc: Device[], device) => {
    const storedDevice = storedDevices.find((storedDevice) => storedDevice.id === device.id);

    if (!storedDevice) {
      acc.push(device);
    }

    return acc;
  }, []);

  return newDevices;
};

/**
 * Formats the device data into a format suitable for storage.
 *
 * @param device - The device object to be formatted.
 * @returns The formatted device data.
 */
const formatDeviceData = (device: Device) => {
  const deviceData: Prisma.DeviceCreateInput = {
    id: device.id,
    name: device.name,
    slug: device.slug,
    lastSeen: new Date().toISOString(),
    status: "OK",
  };

  return deviceData;
};

/**
 * Stores the given devices in the database.
 * @param devices - The devices to be stored.
 * @returns A promise that resolves to the stored devices.
 */
const storeDevices = async (devices: Device[]) => {
  const deviceData = devices.map((device) => formatDeviceData(device));

  const storedDevices = await prisma.device.createMany({
    data: deviceData,
  });

  return storedDevices;
};

/**
 * Stores new devices in the data storage.
 *
 * @param devices - An array of devices to be stored.
 * @returns A promise that resolves to the stored devices.
 */
export const storeNewDevices = async (devices: Device[]) => {
  // Remove devices that are already stored
  const notStoredDevices = await removeStoredDevices(devices);

  if (notStoredDevices.length === 0 || !notStoredDevices?.length) {
    console.log("No new devices to store");
    return [];
  }

  const { count } = await storeDevices(notStoredDevices);
  console.log(`Stored ${count} devices`);

  return notStoredDevices;
};

// Statistics
export const createStatisticEntry = async (data: Prisma.StatisticCreateInput) => {
  return await prisma.statistic.create({
    data,
  });
};

export const syncLogic = async () => {
  // Get devices and store new ones
  const devices = await getDevices();
  await storeNewDevices(devices);

  // Get readings for a device
  // const readings = await getReadings("47d1e925-4ac1-47bb-85ae-eb612ef4e5aa", {
  //   limit: 10,
  // });

  // const testResponse = [
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "1a766a1c-0a1b-4d43-b554-7713f520386c",
  //     location: null,
  //     inserted_at: "2024-01-12T03:02:29.851787Z",
  //     measured_at: "2024-01-12T03:02:29.785906Z",
  //     data: {
  //       battery: 3.427,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4032,
  //       loop2: 4019,
  //       meas_timestamp: "2024-01-12T04:00:13Z",
  //     },
  //     id: "74bdae10-9f0c-4cb4-b202-b51842884fde",
  //   },
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "daf6b407-103b-4339-b553-7f80d957ec5b",
  //     location: null,
  //     inserted_at: "2024-01-11T15:02:30.011849Z",
  //     measured_at: "2024-01-11T15:02:29.938674Z",
  //     data: {
  //       battery: 3.414,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4027,
  //       loop2: 4014,
  //       meas_timestamp: "2024-01-11T04:00:13Z",
  //     },
  //     id: "5ea45574-d03a-41bd-8024-6bf7425a1c57",
  //   },
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "e2ae79b4-6376-4016-92b8-ae8fbcfabac3",
  //     location: null,
  //     inserted_at: "2024-01-10T15:02:25.682307Z",
  //     measured_at: "2024-01-10T15:02:25.636210Z",
  //     data: {
  //       battery: 3.418,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4028,
  //       loop2: 4015,
  //       meas_timestamp: "2024-01-10T04:00:13Z",
  //     },
  //     id: "2f75a632-cbde-4497-ac1d-d80563c252de",
  //   },
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "d6450103-cd90-49e2-89b2-8f4d58393c1b",
  //     location: null,
  //     inserted_at: "2024-01-10T03:02:21.304781Z",
  //     measured_at: "2024-01-10T03:02:21.253890Z",
  //     data: {
  //       battery: 3.418,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4028,
  //       loop2: 4015,
  //       meas_timestamp: "2024-01-10T04:00:13Z",
  //     },
  //     id: "e7491aed-36ac-4d30-988e-e3dcab8cc817",
  //   },
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "5fcbf04c-52c4-498f-8f7c-1cd87e42d155",
  //     location: null,
  //     inserted_at: "2024-01-09T15:02:21.435812Z",
  //     measured_at: "2024-01-09T15:02:21.363140Z",
  //     data: {
  //       battery: 3.418,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4029,
  //       loop2: 4015,
  //       meas_timestamp: "2024-01-09T04:00:13Z",
  //     },
  //     id: "5ba85875-be63-4664-80f4-ac1d0974cf17",
  //   },
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "5c146322-bd5f-4f37-bfd2-e86fc59dd86c",
  //     location: null,
  //     inserted_at: "2024-01-09T03:02:17.144279Z",
  //     measured_at: "2024-01-09T03:02:17.082984Z",
  //     data: {
  //       battery: 3.418,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4029,
  //       loop2: 4015,
  //       meas_timestamp: "2024-01-09T04:00:13Z",
  //     },
  //     id: "56cbd4dd-bf6c-45a1-b4c9-c2fc3fb924b6",
  //   },
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "1a65441d-1d9c-4be2-a983-e38379b5c953",
  //     location: null,
  //     inserted_at: "2024-01-08T15:02:17.092274Z",
  //     measured_at: "2024-01-08T15:02:17.047382Z",
  //     data: {
  //       battery: 3.427,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4033,
  //       loop2: 4020,
  //       meas_timestamp: "2024-01-08T04:00:13Z",
  //     },
  //     id: "6b66a61d-016b-4433-81dd-e127826575f9",
  //   },
  //   {
  //     parser_id: "a773209a-7685-4580-bae9-7c01e8035276",
  //     device_id: "47d1e925-4ac1-47bb-85ae-eb612ef4e5aa",
  //     packet_id: "7112884c-b149-484e-918b-9985dac7a1de",
  //     location: null,
  //     inserted_at: "2024-01-08T03:02:19.085912Z",
  //     measured_at: "2024-01-08T03:02:12.850612Z",
  //     data: {
  //       battery: 3.427,
  //       iso1: 10000,
  //       iso2: 10000,
  //       loop1: 4033,
  //       loop2: 4020,
  //       meas_timestamp: "2024-01-08T04:00:13Z",
  //     },
  //     id: "2c082d84-e2c1-4228-adc7-b8a6baff466b",
  //   },
  // ];

  // const responseData = testResponse.map((entry) => entry.data);

  // const keeped = extractDataValuesByKey(responseData, ["iso1", "iso2", "loop1", "loop2", "contact2"]);

  // const calcStatisticalValues = (data1: number[], data2?: number[]) => {
  //   const medianValue = median(data1);
  //   const meanValue = mean(data1);
  //   const stdDev = standardDeviation(data1);
  //   // const zScoreValue = zScore(data1[0], medianValue, stdDev);
  //   const interquartileRangeValue = interquartileRange(data1);
  //   const sampleCorrelationValue = data2 ? sampleCorrelation(data1, data2) : null;

  //   return {
  //     median: medianValue,
  //     mean: +meanValue.toFixed(2),
  //     stdDev: +stdDev.toFixed(2),
  //     interquartileRange: interquartileRangeValue,
  //     sampleCorrelation: sampleCorrelationValue ? +sampleCorrelationValue.toFixed(2) : null,
  //     // zScore: zScoreValue,
  //     // value: data[0],
  //   };
  // };

  // console.log(calcStatisticalValues(keeped.loop1, keeped.loop2));
};
