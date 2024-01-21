import { ElementKit } from "elementiot-client";
import { ElementResponse, Options } from "elementiot-client/lib/models";
import { ReadingData, DeviceData } from "../interfaces/ElementsResponse";

export class ElementClient extends ElementKit {
  tag: string;

  constructor() {
    super({ apiKey: process.env.ELEMENTS_API_KEY || "" });
    this.tag = process.env.ELEMENTS_TAG_ID || "";
  }

  getDevices(options?: Options) {
    return super.getDevices(options) as Promise<DeviceData[]>;
  }

  getDevice(elementDeviceId: string) {
    return super.getDevice(elementDeviceId) as Promise<ElementResponse<DeviceData>>;
  }

  getDevicesByTagId(tagId: string = this.tag, options?: Options | undefined) {
    return super.getDevicesByTagId(tagId, options) as Promise<DeviceData[]>;
  }

  getReadings(deviceId: string, options?: Options | undefined) {
    return super.getReadings(deviceId, options) as Promise<ReadingData[]>;
  }
}

const useElement = new ElementClient();

export default useElement;
