import { ElementKit } from "elementiot-client";
import { Device, Options, Reading } from "elementiot-client/lib/models";
import { ReadingData } from "../interfaces/ElementsResponse";

const elements = new ElementKit({ apiKey: process.env.ELEMENTS_API_KEY! });

/**
 * Retrieves devices based on the specified criteria.
 * @param inactive - Indicates whether to retrieve inactive devices.
 * @param options - Additional options for retrieving devices.
 * @returns A promise that resolves to an array of devices.
 */
export const getDevices = async (inactive: boolean = false, options: Options = {}) => {
  const tag = inactive ? process.env.ELEMENTS_INACTIVE_FOLDER_ID! : process.env.ELEMENTS_ACTIVE_FOLDER_ID!;

  const devices = await elements.getDevicesByTagId(tag, options);
  return devices;
};

/**
 * Retrieves a device by its ID.
 * @param id The ID of the device.
 * @returns The device object.
 * @throws Error if the device ID is not provided.
 */
export const getDevice = async (id: string) => {
  if (!id) {
    throw new Error("Device ID is required");
  }

  const device = await elements.getDevice(id);
  return device;
};

/**
 * Retrieves the readings for a specific device.
 * @param id - The ID of the device.
 * @param options - Additional options for retrieving the readings.
 * @returns A promise that resolves to the readings.
 * @throws An error if the device ID is missing.
 */
export const getReadings = async (id: string, options: Options = {}) => {
  if (!id) {
    throw new Error("Device ID is required");
  }

  const readings = (await elements.getReadings(id, options)) as ReadingData[];

  return readings;
};