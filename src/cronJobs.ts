"use strict";
import logger from "./services/useLogger";
import { PrismaClient } from "@prisma/client";
import { getDevicesElements, getReadingsElements } from "./services/dataAccess";
import { initiateDeviceReadings, createAndUpdateDevices } from "./services/dataStorage";
import fs from "fs";
const config = require("../config.json");

const prisma = new PrismaClient();

// Initiate devices and first readings
// Updates stored devices if updated in Elements
const handleDevicesAndReadings = async (force: boolean = false) => {
  if (!config?.options || !config?.settings) {
    logger.warn("No config file found");

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
    logger.warn("Required settings are not set");
    return Promise.reject("Required settings are not set");
  }

  if (!initiateReadings && !initiateDevices) {
    logger.info("Device and reading initiation is disabled");
    return Promise.resolve("Device and reading initiation is disabled");
  }

  // Get Active devices from Elements
  const elementsDevices = await getDevicesElements();

  if (!elementsDevices.length) {
    logger.warn("Initiation failed. No devices found");
    return Promise.reject("Initiation failed. No devices found");
  }

  const now = new Date().getTime();

  logger.info("Initiation started!");

  // Handle devices
  if (
    (initiateDevices &&
      now - initiateDevicesIntervalMinutes * 60 * 1000 > new Date(lastDevicesInitiation).getTime()) ||
    (initiateDevices && force)
  ) {
    logger.info("Initiating devices");
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
          logger.warn("Error writing to config file: ", err);
          return;
        }
        logger.info("Last devices initiation successful updated in config file!");
        return;
      }
    );
  } else {
    logger.info("Device initiation skipped");
    logger.info("- Last initiation: ", new Date(lastDevicesInitiation).toISOString());
    logger.info(
      "- Next initiation: ",
      new Date(
        new Date(lastDevicesInitiation).getTime() + initiateDevicesIntervalMinutes * 60 * 1000
      ).toISOString()
    );
  }

  // Handle readings
  if (
    (initiateReadings &&
      now - initiateReadingsIntervalMinutes * 60 * 1000 > new Date(lastReadingsInitiation).getTime()) ||
    (initiateReadings && force)
  ) {
    logger.info("Initiating readings");
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
          logger.error("Error writing to config file: ", err);
          return;
        }
        logger.info("Last readings initiation successful updated in config file!");
        return;
      }
    );
  } else {
    logger.info("Reading initiation skipped");
    logger.info("- Last initiation: ", new Date(lastReadingsInitiation).toISOString());
    logger.info(
      "- Next initiation: ",
      new Date(
        new Date(lastReadingsInitiation).getTime() + initiateReadingsIntervalMinutes * 60 * 1000
      ).toISOString()
    );
  }
  logger.info("Initiation finished!");
  return Promise.resolve("Initiation finished!");
};

const cronJobs = async () => {
  const force = false;
  logger.info("Cron job started!");
  await handleDevicesAndReadings(force);
};

export default cronJobs;
