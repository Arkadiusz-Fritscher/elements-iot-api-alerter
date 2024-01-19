import { ReadingData } from "../interfaces/ElementsResponse";
import { PrismaClient, Device, DeviceStatus } from "@prisma/client";
import logger from "./loggerModule";
import useElement from "./elementModule";

const prisma = new PrismaClient();

export const initiateDeviceReadings = async (id: Device["id"]) => {
  try {
    logger.info(`Initiating readings for device ${id}`);
    const storedDevice = await prisma.device.findUnique({
      where: {
        id: id,
      },
      include: {
        _count: {
          select: { readings: true },
        },
      },
    });

    if (!storedDevice) {
      logger.error(`Device ${id} not found`);
      return;
    }

    if (storedDevice._count?.readings !== 0 || storedDevice.status !== DeviceStatus.PENDING) {
      logger.warn(
        `Initiating readings for device ${id} failed. Device already has readings or status isn't pending`
      );
      return;
    }

    const elementsReadings = (await useElement.getReadings(id, {
      sort: "inserted_at",
      sortDirection: "desc",
      filter: "data.iso1!=null&&data.iso2!=null&&data.loop1!=null&&data.loop2!=null",
    })) as ReadingData[];

    if (!elementsReadings?.length) {
      logger.error(`No readings found for device ${id}`);
      return;
    } else {
      logger.info(`Readings received for device ${id}: ${elementsReadings.length}`);
    }

    // Remove readings with same meas_timestamp
    const uniqueReadings = elementsReadings.filter(
      (reading, index, self) =>
        index === self.findIndex((r) => r.data.meas_timestamp === reading.data.meas_timestamp)
    );

    logger.info(`Unique readings for device ${id}: ${uniqueReadings.length}`);

    const storedReadings = await prisma.reading.createMany({
      data: uniqueReadings.map((reading) => ({
        battery: reading.data.battery,
        deviceId: reading.device_id,
        measuredAt: reading.data.meas_timestamp,
        iso1: reading.data.iso1,
        iso2: reading.data.iso2,
        loop1: reading.data.loop1,
        loop2: reading.data.loop2,
        temp: reading.data?.temp,
        id: reading.id,
      })),
    });

    logger.info(`Readings stored for device ${id}: ${storedReadings.count}`);

    await prisma.device.update({
      where: {
        id: id,
      },
      data: {
        status: DeviceStatus.ACTIVE,
      },
    });

    logger.info(`Device ${id} status updated to active`);

    return storedReadings;
  } catch (error) {
    logger.error(error);
  }
};

export const handleReadings = () => {};

export default handleReadings;
