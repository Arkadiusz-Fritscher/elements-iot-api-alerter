import { Device } from "@prisma/client";
import { ReadingData, DeviceData } from "../../interfaces/ElementsResponse";

export const getDevicesToAdd = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  const devicesToAdd = elementsDevices.filter((elementDevice) => {
    return !databaseDevices.some((databaseDevice) => {
      return databaseDevice.id === elementDevice.id;
    });
  });
  return devicesToAdd;
};

export const getDevicesToUpdate = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
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

export const getDevicesToDeactivate = (elementsDevices: DeviceData[], databaseDevices: Device[]) => {
  const devicesToDeactivate = databaseDevices.filter((databaseDevice) => {
    return !elementsDevices.some((elementDevice) => {
      return databaseDevice.id === elementDevice.id;
    });
  });
  return devicesToDeactivate;
};
