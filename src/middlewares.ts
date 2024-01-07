import { NextFunction, Request, Response } from "express";
import { verify, sign } from "jsonwebtoken";
import ErrorResponse from "./interfaces/ErrorResponse";

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
}

export function logErrors(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  next(err);
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Initialize a test token
  // const token = `${sign({ name: "test" }, process.env.APP_SECRET as string, { expiresIn: "15m" })}`;

  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401);
    throw new Error("You must send an Authorization header");
  }

  const [authType, token] = authorization.split(" ");
  if (authType !== "Bearer") {
    res.status(403);
    throw new Error("Expected a Bearer token");
  }

  verify(token, process.env.APP_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(403);
      throw new Error("Invalid token");
    }

    console.log("decoded", decoded);
    next();
  });
}
