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

// POST /statistics/type
export const validateCreateStatistic = [
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
export const validateUpdateStatistic = [
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
