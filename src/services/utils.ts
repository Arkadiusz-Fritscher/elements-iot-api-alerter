import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { Request } from "express";

export const generateTokenObject = (user: Prisma.$UserPayload["scalars"]) => {
  const expiresIn = 3600;
  const token = generateToken(user, expiresIn);

  return {
    jwt: token,
    tokenType: "Bearer",
    expiresIn,
  };
};

export const generateToken = (
  user: Prisma.$UserPayload["scalars"],
  expiresIn: jwt.SignOptions["expiresIn"] = "1h"
) => {
  const payload = {
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.APP_SECRET!, {
    expiresIn,
  });

  return token;
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.APP_SECRET!);
};

export const isAuth = (req: Request) => {
  const { authorization } = req.headers;

  if (authorization) {
    const token = authorization.split(" ")[1];
    const verifiedToken = verifyToken(token) as Prisma.$UserPayload["scalars"];

    return verifiedToken ? true : false;
  }

  return false;
};
