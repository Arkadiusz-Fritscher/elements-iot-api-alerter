"use strict";
import { Reading } from "elementiot-client/lib/models";

const extractReadingData = <T extends keyof Reading>(readings: Reading[], extractingKeys: T[]) => {};
