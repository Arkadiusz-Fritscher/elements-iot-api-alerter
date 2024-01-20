"use strict";
import useElement from "./elementModule";
import { DeviceData } from "../interfaces/ElementsResponse";
import logger from "./loggerModule";
import { PrismaClient, Device, DeviceStatus } from "@prisma/client";

const prisma = new PrismaClient();

const getDevicesToAdd = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  logger.info(
    `Comparing ${elementsDevices.length} devices from Elements with ${databaseDevices.length} devices from the database`
  );
  const devicesToAdd = elementsDevices.filter((elementDevice) => {
    return !databaseDevices.some((databaseDevice) => {
      return databaseDevice.id === elementDevice.id;
    });
  });

  logger.info(`Found ${devicesToAdd.length} devices to add to the database`);
  return devicesToAdd;
};

const getDevicesToUpdate = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  logger.info(
    `Comparing ${elementsDevices.length} devices from Elements with ${databaseDevices.length} devices from the database`
  );
  const devicesToUpdate = elementsDevices.filter((elementDevice) => {
    return databaseDevices.some((databaseDevice) => {
      return (
        databaseDevice.id === elementDevice.id &&
        new Date(databaseDevice.updatedAt).getTime() < new Date(elementDevice.updated_at).getTime()
      );
    });
  });

  logger.info(`Found ${devicesToUpdate.length} devices to update in the database`);
  return devicesToUpdate;
};

const getDevicesToDeactivate = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  logger.info(
    `Comparing ${elementsDevices.length} devices from Elements with ${databaseDevices.length} devices from the database`
  );
  const devicesToDeactivate = databaseDevices.filter((databaseDevice) => {
    return !elementsDevices.some((elementDevice) => {
      return databaseDevice.id === elementDevice.id;
    });
  });

  logger.info(`Found ${devicesToDeactivate.length} devices to deactivate in the database`);
  return devicesToDeactivate;
};

const addDevices = (devicesToAdd: DeviceData[]) => {
  logger.info(`Adding ${devicesToAdd.length} devices to the database`);
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
  logger.info(`Updating ${devicesToUpdate.length} devices in the database`);
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
  logger.info(`Deactivating ${devicesToDeactivate.length} devices in the database`);
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

const checkDevicesToUpdate = async () => {
  try {
    logger.info("Checking devices to update");

    const elementsDevices = await useElement.getDevicesByTagId();
    const databaseDevices = await prisma.device.findMany();

    const devicesToUpdate = getDevicesToUpdate(elementsDevices, databaseDevices);
    const devicesToDeactivate = getDevicesToDeactivate(elementsDevices, databaseDevices);

    if (devicesToUpdate?.length) {
      updateDevices(devicesToUpdate);
    }

    if (devicesToDeactivate?.length) {
      deactivateDevices(devicesToDeactivate);
    }

    logger.info("Device update finished");
  } catch (error) {
    logger.error(error);
  }
};

const initializeDevices = async () => {
  try {
    logger.info("Device initialization started");
    const elementsDevices = await useElement.getDevicesByTagId();
    const databaseDevices = await prisma.device.findMany();

    const devicesToAdd = getDevicesToAdd(elementsDevices, databaseDevices);

    if (devicesToAdd?.length) {
      addDevices(devicesToAdd);
    }

    logger.info("Device initialization finished");
  } catch (error) {
    logger.error(error);
  }
};

export const handleDevices = () => {
  const initializationIntervalInMinutes = 10;

  setInterval(() => {
    initializeDevices();
  }, 1000 * 60 * initializationIntervalInMinutes);

  const updateIntervalInMinutes = 60;

  setInterval(() => {
    checkDevicesToUpdate();
  }, 1000 * 60 * updateIntervalInMinutes);
};

export default handleDevices;
