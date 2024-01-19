"use strict";
import useElement from "./elementModule";
import { ReadingData, DeviceData } from "../interfaces/ElementsResponse";
import logger from "./loggerModule";
import { Prisma, PrismaClient, Device, DeviceStatus } from "@prisma/client";

const prisma = new PrismaClient();

const getDevicesToAdd = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  const devicesToAdd = elementsDevices.filter((elementDevice) => {
    return !databaseDevices.some((databaseDevice) => {
      return databaseDevice.id === elementDevice.id;
    });
  });
  return devicesToAdd;
};

const getDevicesToUpdate = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  const devicesToUpdate = elementsDevices.filter((elementDevice) => {
    return databaseDevices.some((databaseDevice) => {
      return (
        databaseDevice.id === elementDevice.id &&
        new Date(databaseDevice.updatedAt).getTime() < new Date(elementDevice.updated_at).getTime()
      );
    });
  });
  return devicesToUpdate;
};

const getDevicesToDeactivate = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  const devicesToDeactivate = databaseDevices.filter((databaseDevice) => {
    return !elementsDevices.some((elementDevice) => {
      return databaseDevice.id === elementDevice.id;
    });
  });
  return devicesToDeactivate;
};

const addDevices = (devicesToAdd: DeviceData[]) => {
  devicesToAdd.forEach(async (device) => {
    try {
      const newDevice = await prisma.device.create({
        data: {
          id: device.id,
          name: device.name,
          slug: device.slug,
          lastSeen: new Date().toISOString(),
          status: DeviceStatus.PENDING,
        },
      });
      logger.info(`Added device ${newDevice.name} to the database`);
    } catch (error) {
      logger.error(error);
    }
  });
};

const updateDevices = (devicesToUpdate: DeviceData[]) => {
  devicesToUpdate.forEach(async (device) => {
    try {
      const updatedDevice = await prisma.device.update({
        where: {
          id: device.id,
        },
        data: {
          lastSeen: new Date().toISOString(),
          name: device.name,
          slug: device.slug,
        },
      });
      logger.info(`Updated device ${updatedDevice.name} in the database`);
    } catch (error) {
      logger.error(error);
    }
  });
};

const deactivateDevices = (devicesToDeactivate: Device[]) => {
  devicesToDeactivate.forEach(async (device) => {
    try {
      const updatedDevice = await prisma.device.update({
        where: {
          id: device.id,
        },
        data: {
          status: DeviceStatus.INACTIVE,
        },
      });
      logger.info(`Deactivated device ${updatedDevice.name} in the database`);
    } catch (error) {
      logger.error(error);
    }
  });
};

const compareDevices = async () => {
  try {
    const elementsDevices = await useElement.getDevicesByTagId();
    const databaseDevices = await prisma.device.findMany();
    const devicesToAdd = getDevicesToAdd(elementsDevices, databaseDevices);
    const devicesToUpdate = getDevicesToUpdate(elementsDevices, databaseDevices);
    const devicesToDeactivate = getDevicesToDeactivate(elementsDevices, databaseDevices);
    addDevices(devicesToAdd);
    updateDevices(devicesToUpdate);
    deactivateDevices(devicesToDeactivate);
  } catch (error) {
    logger.error(error);
  }
};

export const handleDevices = () => {
  setInterval(() => {
    logger.info("Comparing devices");
    compareDevices();
  }, 1000 * 60 * 60 * 3);
  // compareDevices();
};

export default handleDevices;
