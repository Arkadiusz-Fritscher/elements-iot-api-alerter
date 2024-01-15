import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { validationResult, param } from "express-validator";
import { validateGetReadings } from "../middlewares/validationMiddlewares";
import { ReadingData } from "../interfaces/ElementsResponse";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:id", validateGetReadings, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const { id } = req.params;
  const { limit } = req.query;

  const readings = await prisma.reading.findMany({
    where: {
      deviceId: id,
    },
    take: limit ? (Number(limit) > 100 ? 100 : Number(limit)) : 30,
    orderBy: {
      measuredAt: "desc",
    },
    include: {
      device: {
        select: {
          name: true,
          id: true,
          lastSeen: true,
          statistics: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          slug: true,
        },
      },
    },
  });

  return res.status(200).json(readings);
});

export default router;
