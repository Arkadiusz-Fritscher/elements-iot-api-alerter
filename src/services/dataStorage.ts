import { PrismaClient, Prisma } from "@prisma/client";
import { Device } from "elementiot-client/lib/models";
import { getDevicesElements, getReadingsElements } from "./dataAccess";
import { DeviceData, ReadingData } from "../interfaces/ElementsResponse";
import { reduceReadingsToUniqueMeasTimestamps } from "./utils";
import logger from "./useLogger";
const config = require("../../config.json");

const prisma = new PrismaClient();

/**
 * Removes the devices that already stored.
 *
 * @param devices - The devices to be removed.
 * @returns The updated list of devices after removal.
 */
const removeStoredDevices = async (devices: DeviceData[]) => {
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

  const newDevices = devices.reduce((acc: DeviceData[], device) => {
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
const formatDeviceData = (device: DeviceData) => {
  const deviceData: Prisma.DeviceCreateInput = {
    id: device.id,
    name: device.name,
    slug: device.slug,
    lastSeen: new Date().toISOString(),
    status: "OK",
  };

  return deviceData;
};

const formatReadingData = (reading: ReadingData) => {
  const readingData: Prisma.ReadingUncheckedCreateInput = {
    battery: reading.data.battery,
    deviceId: reading.device_id,
    iso1: reading.data.iso1,
    iso2: reading.data.iso2,
    loop1: reading.data.loop1,
    loop2: reading.data.loop2,
    measuredAt: reading.measured_at,
    temp: reading.data.temp || undefined,
    id: reading.id,
  };

  return readingData;
};

/**
 * Stores the given devices in the database.
 * @param devices - The devices to be stored.
 * @returns A promise that resolves to the stored devices.
 */
const storeDevices = async (devices: DeviceData[]) => {
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
export const storeNewDevices = async (devices: DeviceData[]) => {
  // Remove devices that are already stored
  const notStoredDevices = await removeStoredDevices(devices);

  if (notStoredDevices.length === 0 || !notStoredDevices?.length) {
    logger.info("No new devices to store");
    return [];
  }

  const { count } = await storeDevices(notStoredDevices);
  logger.info(`${count} new devices stored`);

  return notStoredDevices;
};

/**
 * Updates the stored device with the provided device data.
 *
 * @param device The device object to update.
 * @returns The updated device object.
 */
const updateStoredDevice = async (device: DeviceData) => {
  try {
    if (!device) {
      logger.warn("No Device to update provided");
      return;
    }

    const deviceData = formatDeviceData(device);

    const updatedDeviceResponse = await prisma.device.update({
      where: {
        id: device.id,
      },
      data: deviceData,
    });

    logger.info(`Updated Device ${updatedDeviceResponse.name}`);
    return updatedDeviceResponse;
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Updates the stored devices with the provided devices.
 *
 * @param devices - An array of devices to update.
 * @returns A promise that resolves to an array of updated devices.
 */
export const updateStoredDevices = async (devices: DeviceData[]) => {
  try {
    if (!devices?.length) {
      logger.warn("No Devices to update provided");
      return;
    }

    const updatedDevices = await Promise.all(devices.map((device) => updateStoredDevice(device)));

    logger.info("Updated Devices ", updatedDevices.length);

    return updatedDevices;
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Handles the devices.
 *
 * @param devices - The devices to be handled.
 */
export const createAndUpdateDevices = async (devices: DeviceData[]) => {
  try {
    if (!devices?.length) {
      logger.warn("No Devices to handle provided");
      return;
    }

    const currentStoredDevices = await prisma.device.findMany();

    // Sort devices into already stored and not stored devices
    const { alreadyStoredDevices, notStoredDevices } = devices.reduce(
      (acc: { alreadyStoredDevices: DeviceData[]; notStoredDevices: DeviceData[] }, device) => {
        const storedDevice = currentStoredDevices.find((storedDevice) => storedDevice.id === device.id);

        if (storedDevice) {
          if (new Date(device?.updated_at) > new Date(storedDevice?.updatedAt)) {
            acc.alreadyStoredDevices.push(device);
            return acc;
          }
        } else {
          acc.notStoredDevices.push(device);
        }

        return acc;
      },
      { alreadyStoredDevices: [], notStoredDevices: [] }
    );

    // Store devices that are not stored
    notStoredDevices.length && (await storeDevices(notStoredDevices));

    // Update devices that are already stored
    alreadyStoredDevices.length && (await updateStoredDevices(alreadyStoredDevices));

    return { updatedDevices: alreadyStoredDevices.length, newDevices: notStoredDevices.length };
  } catch (err) {
    logger.error(err);
  }
};

export const storeReading = async (data: ReadingData) => {
  try {
    const formattedReading = formatReadingData(data);

    const { battery, deviceId, iso1, iso2, loop1, loop2, measuredAt, temp, id } = formattedReading;

    const storedReading = await prisma.reading.create({
      data: {
        battery,
        device: {
          connect: {
            id: deviceId,
          },
        },
        iso1,
        iso2,
        loop1,
        loop2,
        measuredAt,
        temp,
        id,
      },
    });

    return storedReading;
  } catch (err) {
    logger.error(err);
  }
};

export const storeReadings = async (readings: ReadingData[]) => {
  try {
    // Remove readings with duplicate measuredAt timestamps
    const uniqueReadings = reduceReadingsToUniqueMeasTimestamps(readings);

    const result = await Promise.all(uniqueReadings.map((reading) => storeReading(reading)));
    return result;
  } catch (err) {
    logger.error(err);
  }
};

export const initiateDeviceReadings = async (deviceId: Prisma.ReadingUncheckedCreateInput["deviceId"]) => {
  try {
    const initialReadings = config.options.maxInitialReadings || 0;

    if (!deviceId || deviceId.length < 5) {
      logger.warn("No deviceId provided");
      return;
    }

    const currentReadingsLength = await prisma.reading.count({
      where: {
        deviceId,
      },
    });

    if (currentReadingsLength >= initialReadings || currentReadingsLength >= +initialReadings * 0.9) {
      return;
    }

    // If no readings are stored for the device, get initial readings
    if (initialReadings && currentReadingsLength === 0) {
      // Get Readings for device
      const elementReadings = await getReadingsElements(deviceId, {
        sort: "inserted_at",
        sortDirection: "desc",
        filter: "data.iso1!=null&&data.iso2!=null&&data.loop1!=null&&data.loop2!=null",
      });

      // Store readings in database

      const storedReadings = await storeReadings(elementReadings);

      logger.info(`Initial readings stored: ${storedReadings?.length} from ${elementReadings?.length}`);

      return storedReadings;
    }

    // if (initialReadings && currentReadingsLength > 0 && currentReadingsLength < initialReadings) {
    //   // Get Readings AFTER the OLDEST stored reading

    //   logger.info(
    //     `Device ${deviceId} has ${currentReadingsLength} readings. Getting ${
    //       initialReadings - currentReadingsLength
    //     } more}`
    //   );

    //   const newestStoredReading = await prisma.reading.findFirst({
    //     where: {
    //       deviceId,
    //     },
    //     orderBy: {
    //       measuredAt: "asc",
    //     },
    //   });

    //   const elementReadings = await getReadingsElements(deviceId, {
    //     limit: initialReadings - currentReadingsLength,
    //     sort: "inserted_at",
    //     sortDirection: "desc",
    //     retrieveAfterId: newestStoredReading?.id,
    //     filter: `data.iso1!=null&&data.iso2!=null&&data.loop1!=null&&data.loop2!=null`,
    //   });

    //   if (!elementReadings?.length) {
    //     logger.info(`No more readings to store for device ${newestStoredReading?.deviceId}`);
    //     return;
    //   }

    //   const storedReadings = await storeReadings(elementReadings);
    //   logger.info(`Initial readings stored: ${storedReadings?.length}`);
    //   return storedReadings;
    // }

    return;
  } catch (err) {
    logger.error(err);
  }
};
