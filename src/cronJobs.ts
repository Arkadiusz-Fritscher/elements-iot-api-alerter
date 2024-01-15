"use strict";
import { getStatisticalValues } from "./services/dataAnalyze";
import { PrismaClient } from "@prisma/client";
import { getDevices as getElementsDevices, getReadings } from "./services/dataAccess";
import { initiateDeviceReadings, createAndUpdateDevices } from "./services/dataStorage";
import fs from "fs";
const config = require("../config.json");

const prisma = new PrismaClient();

// Initiate devices and first readings
// Updates stored devices if updated in Elements
const handleDevicesAndReadings = async (force: boolean = false) => {
  if (!config?.options || !config?.settings) {
    console.log("No config found");
    return Promise.reject("No config found");
  }

  const {
    initiateReadings,
    initiateDevices,
    initiateReadingsIntervalMinutes,
    initiateDevicesIntervalMinutes,
  } = config.options;
  const { lastReadingsInitiation, lastDevicesInitiation } = config.settings;

  // Check if required settings are set
  if (
    initiateReadings === undefined ||
    initiateDevices === undefined ||
    initiateReadingsIntervalMinutes === undefined ||
    initiateDevicesIntervalMinutes === undefined ||
    lastReadingsInitiation === undefined ||
    lastDevicesInitiation === undefined
  ) {
    console.log("Required settings are not set");
    return Promise.reject("Required settings are not set");
  }

  if (!initiateReadings && !initiateDevices) {
    console.log("Device and reading initiation is disabled");
    return Promise.resolve("Device and reading initiation is disabled");
  }

  // Get Active devices from Elements
  const elementsDevices = await getElementsDevices();

  if (!elementsDevices.length) {
    console.log("Initiation failed. No devices found");
    return Promise.reject("Initiation failed. No devices found");
  }

  const now = new Date().getTime();

  console.group("Initiation started!");

  // Handle devices
  if (
    (initiateDevices &&
      now - initiateDevicesIntervalMinutes * 60 * 1000 > new Date(lastDevicesInitiation).getTime()) ||
    (initiateDevices && force)
  ) {
    console.log("Initiating devices");
    // Create and update devices in database
    await createAndUpdateDevices(elementsDevices);

    // Update config
    fs.writeFile(
      "./config.json",
      JSON.stringify(
        { ...config, settings: { ...config.settings, lastDevicesInitiation: new Date().toISOString() } },
        null,
        2
      ),
      (err) => {
        if (err) {
          console.log("Error writing to config file: ", err);
          return;
        }
        console.log("Last devices initiation successful updated in config file!");
        return;
      }
    );
  } else {
    console.group("Device initiation skipped");
    console.log("- Last initiation: ", new Date(lastDevicesInitiation).toISOString());
    console.log(
      "- Next initiation: ",
      new Date(
        new Date(lastDevicesInitiation).getTime() + initiateDevicesIntervalMinutes * 60 * 1000
      ).toISOString()
    );
    console.groupEnd();
  }

  // Handle readings
  if (
    (initiateReadings &&
      now - initiateReadingsIntervalMinutes * 60 * 1000 > new Date(lastReadingsInitiation).getTime()) ||
    (initiateReadings && force)
  ) {
    console.log("Initiating readings");
    // Get Elements devices IDs
    const deviceIds = elementsDevices.map((device) => device.id);

    // Initial population of readings for devices
    await Promise.all(deviceIds.map((deviceId) => initiateDeviceReadings(deviceId)));

    // Update config
    fs.writeFile(
      "./config.json",
      JSON.stringify(
        { ...config, settings: { ...config.settings, lastReadingsInitiation: new Date().toISOString() } },
        null,
        2
      ),
      (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Last readings initiation successful updated in config file!");
      }
    );
  } else {
    console.group("Reading initiation skipped");
    console.log("- Last initiation: ", new Date(lastReadingsInitiation).toISOString());
    console.log(
      "- Next initiation: ",
      new Date(
        new Date(lastReadingsInitiation).getTime() + initiateReadingsIntervalMinutes * 60 * 1000
      ).toISOString()
    );
    console.groupEnd();
  }

  console.groupEnd();
  console.log("Initiation finished!");
  return Promise.resolve("Initiation finished!");
};

const cronJobs = async () => {
  const force = false;

  console.info("Cron job started!");
  await handleDevicesAndReadings(force);
};

export default cronJobs;
