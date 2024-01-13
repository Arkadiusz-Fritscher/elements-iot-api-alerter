import { body, param } from "express-validator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  /signup
export const validateSignup = [
  body("email").isEmail().normalizeEmail().withMessage("Ungültige E-Mail-Adresse"),
  body("username").trim().isLength({ min: 4 }).withMessage("Nutzername muss mindestens 4 Zeichen lang sein"),
  body("password").isLength({ min: 6 }).withMessage("Passwort muss mindestend 6 Zeichen lang sein").escape(),
];

//  /auth
export const validateAuth = [
  body("username").trim().isLength({ min: 4 }),
  body("password").isLength({ min: 6 }).escape(),
];

// POST /statistics
export const validateCreateStatistic = [
  body("value").isFloat().withMessage("Ungültiger Wert (value)"),
  body("sampleSize").isInt().withMessage("Ungültige Stichprobengröße (sampleSize)"),
  body("typeId")
    .exists()
    .withMessage("typeId muss angegeben werden")
    .isInt()
    .withMessage("Ungültige Statistik-Typ-ID")
    .custom((value) => {
      return prisma.statisticTypeDefinition.findUnique({ where: { id: value } }).then((statistic) => {
        if (!statistic) {
          return Promise.reject("Es existiert kein Statistik-Typ mit dieser ID");
        }
      });
    }),
  body("deviceId")
    .exists()
    .withMessage("deviceId muss angegeben werden")
    .trim()
    .isUUID()
    .withMessage("Ungültige Geräte-ID")
    .custom((value, { req }) => {
      return prisma.device
        .findUnique({
          where: { id: value },
          select: { statistic: { include: { type: true } } },
        })
        .then((device) => {
          if (!device) {
            return Promise.reject("Es existiert kein Gerät mit dieser ID");
          }

          if (device?.statistic.some((statistic) => statistic.type.id === req.body.typeId)) {
            return Promise.reject("Es existiert bereits eine Statistik dieses Typs für dieses Gerät");
          }
        });
    }),
];

// POST /statistics/type
export const validateCreateStatisticType = [
  body("name")
    .exists()
    .withMessage("Name muss angegeben werden")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name muss mindestens 3 Zeichen lang sein")
    .escape()
    .custom((value) => {
      return prisma.statisticTypeDefinition.findUnique({ where: { name: value } }).then((statistic) => {
        if (statistic) {
          return Promise.reject("Ein Statistik-Typ mit diesem Namen ist bereits vorhanden");
        }
      });
    }),
  body("unit")
    .exists()
    .withMessage("Unit muss angegeben werden")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Unit muss mindestens 1 Zeichen lang sein")
    .escape(),
  body("description").optional().trim().escape(),
];

// PATCH /statistics/type/:id
export const validateUpdateStatisticType = [
  param("id").toInt().isInt().withMessage("Ungültige Statistik-Typ-ID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name muss mindestens 3 Zeichen lang sein")
    .escape(),
  body("unit")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Unit muss mindestens 1 Zeichen lang sein")
    .escape(),
  body("description").optional().trim().escape(),
];
