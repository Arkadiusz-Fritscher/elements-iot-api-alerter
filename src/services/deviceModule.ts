"use strict";
import useElement from "./elementModule";
import { DeviceData } from "../interfaces/ElementsResponse";
import logger from "./loggerModule";
import AppError from "./errorService";
import { PrismaClient, Device, DeviceStatus } from "@prisma/client";
import { getDevicesToAdd, getDevicesToUpdate, getDevicesToDeactivate } from "./utils/deviceUtils";

const prisma = new PrismaClient();

const addDevice = async (device: DeviceData) => {
  logger.info(`Adding device ${device.name} to the database...`);

  const newDevice = await prisma.device.create({
    data: {
      id: device.id,
      name: device.name,
      slug: device.slug,
      lastSeen: new Date().toISOString(),
      status: DeviceStatus.PENDING,
    },
  });

  if (!newDevice?.id) {
    throw new AppError(`Adding Device ${device.id} to Database fails`, 500).log({
      service: "deviceModule",
      method: "addDevice",
    });
  }

  logger.info(`Device ${newDevice.id} added successfully to the database`);
  return newDevice;
};

const updateDevice = async (device: DeviceData) => {
  logger.info(`Updating device ${device.id} in the database`);

  const updatedDevice = await prisma.device.update({
    where: {
      id: device.id,
    },
    data: {
      name: device.name,
      slug: device.slug,
    },
  });

  if (!updatedDevice?.id) {
    throw new AppError(`Updating Device ${device.id} in Database fails`, 500).log({
      service: "deviceModule",
      method: "updateDevice",
    });
  }

  logger.info(`Device ${updatedDevice.id} updated successfully in the database`);
  return updatedDevice;
};

const deactivateDevice = async (id: Device["id"]) => {
  logger.info(`Deactivating device ${id} in the database`);

  const updatedDevice = await prisma.device.update({
    where: {
      id: id,
    },
    data: {
      status: DeviceStatus.INACTIVE,
    },
  });

  if (!updatedDevice?.id || updatedDevice?.status !== DeviceStatus.INACTIVE) {
    throw new AppError(`Deactivating Device ${id} in Database fails`, 500).log({
      service: "deviceModule",
      method: "deactivateDevice",
    });
  }
  logger.info(`Deactivated device ${updatedDevice.name} in the database`);

  return updatedDevice;
};

export const updateAndDeactivateDevices = async () => {
  logger.info("Checking devices to update");

  const elementsDevices = await useElement.getDevicesByTagId();
  const databaseDevices = await prisma.device.findMany();

  const devicesToUpdate = getDevicesToUpdate(elementsDevices, databaseDevices);
  const devicesToDeactivate = getDevicesToDeactivate(elementsDevices, databaseDevices);

  const result = {
    updated: <Device[] | []>[],
    deactivate: <Device[] | []>[],
  };

  if (devicesToUpdate?.length) {
    const updatedDevices = await Promise.all(devicesToUpdate.map((device) => updateDevice(device)));
    result.updated = updatedDevices;
  }

  if (devicesToDeactivate?.length) {
    const deactivatedDevices = await Promise.all(
      devicesToDeactivate.map((device) => deactivateDevice(device.id))
    );
    result.deactivate = deactivatedDevices;
  }

  logger.info("Device update finished");
  return result;
};

export const initializeDevices = async () => {
  logger.info("Device initialization started");
  const elementsDevices = await useElement.getDevicesByTagId();
  const databaseDevices = await prisma.device.findMany();

  const devicesToAdd = getDevicesToAdd(elementsDevices, databaseDevices);

  if (devicesToAdd?.length) {
    const addedDevices = await Promise.all(devicesToAdd.map((device) => addDevice(device)));
    logger.info(`Added ${addedDevices.length} devices to the database`);
    return addedDevices;
  }

  logger.info(`No devices to add to the database. ${databaseDevices.length} devices found`);
  return [];
};

export const initializeDevice = async (id: string) => {
  logger.info(`Device initialization started for device ${id}`);

  const elementDevice = await useElement.getDevice(id);
  const databaseDevice = await prisma.device.findUnique({
    where: {
      id,
    },
  });

  if (databaseDevice?.id) {
    throw new AppError(`Device ${id} already exists in the database`, 409).log({
      service: "deviceModule",
      method: "initializeDevice",
    });
  }

  if (elementDevice?.body?.id) {
    const addedDevice = await addDevice(elementDevice.body);
    logger.info(`Device ${addedDevice.id} added to the database`);
    return addedDevice;
  }

  logger.info(`No device found for id ${id}`);
  return null;
};

export const handleDevices = () => {
  const initializationIntervalHours = 8;
  const updateIntervalHours = 3;

  setInterval(() => {
    initializeDevices();
  }, 1000 * 60 * 60 * initializationIntervalHours);

  setInterval(() => {
    updateAndDeactivateDevices();
  }, 1000 * 60 * 60 * updateIntervalHours);
};

export default handleDevices;
