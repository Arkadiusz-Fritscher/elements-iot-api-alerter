import { body } from "express-validator";

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
