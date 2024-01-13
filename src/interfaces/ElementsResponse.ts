import { Device, Reading } from "elementiot-client/lib/models";

export interface Data {
  battery: number;
  contact1?: number;
  contact1_state?: ContactState;
  contact2?: number;
  contact2_state?: ContactState;
  iso1: number;
  iso2: number;
  loop1: number;
  loop2: number;
  meas_timestamp: string | Date;
  temp?: number;
  error_error_eeprom_write?: number;
}

export enum ContactState {
  Open = "open",
  Closed = "closed",
}

/**
 * Represents a reading with data.
 */
export interface ReadingData extends Reading {
  data: Data;
}
