import express, { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { validateAuth } from "../middlewares/validationMiddlewares";
import { PrismaClient } from "@prisma/client";
import { generateTokenObject } from "../services/utils";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", validateAuth, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const prisma = new PrismaClient();

  const { username, password } = req.body;

  // Find user in database
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    res.status(401);
    return next(new Error("Nutzer nicht gefunden"));
  }

  // Compare passwords
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    res.status(401);
    return next(new Error("Ungültige Anmeldeinformationen"));
  }

  // Generate token
  const token = generateTokenObject(user);

  // Update lastLogin
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLogin: new Date(),
    },
  });

  res.status(200).json({
    id: user.id,
    email: user.email,
    username: user.username,
    token,
  });
});

export default router;
