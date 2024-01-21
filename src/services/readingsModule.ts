import { PrismaClient, Device, DeviceStatus } from "@prisma/client";
import useElement from "./elementModule";
import { validateMeasurementDate, removeIdenticalReadings } from "./utils/readingUtils";
import logger from "./loggerModule";
import AppError from "./errorService";

const prisma = new PrismaClient();

export const initiateDeviceReadings = async (id: Device["id"]) => {
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

  if (!storedDevice?.id) {
    throw new AppError("No device found with this id", 404).log();
  }

  // TODO: Lerne wir man richtig mit Errors umgeht
  if (storedDevice._count?.readings !== 0 || storedDevice.status !== DeviceStatus.PENDING) {
    throw new AppError("Device already has readings or status isn't pending", 400).log();
  }

  const elementsReadings = await useElement.getReadings(id, {
    sort: "inserted_at",
    sortDirection: "desc",
    filter: "data.iso1!=null&&data.iso2!=null&&data.loop1!=null&&data.loop2!=null",
  });

  if (!elementsReadings?.length) {
    throw new AppError(`No readings found for device ${id} on Element API`, 404).log();
  } else {
    logger.info(`${elementsReadings.length} readings received for device ${id}`);
  }

  // Remove readings with same meas_timestamp
  const uniqueReadings = removeIdenticalReadings(elementsReadings);

  if (!uniqueReadings.length) {
    throw new AppError(`No unique readings found for device ${id}`, 404).log();
  }

  logger.info(`${uniqueReadings.length} unique readings for device ${id}`);

  const storedReadings = await prisma.reading.createMany({
    data: uniqueReadings.map((reading) => ({
      battery: reading.data.battery,
      deviceId: reading.device_id,
      measuredAt: validateMeasurementDate(reading),
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
};

export const handleReadings = () => {};

export default handleReadings;
