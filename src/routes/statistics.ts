import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { validationResult, param } from "express-validator";
import { validateCreateStatistic, validateUpdateStatistic } from "../middlewares/validationMiddlewares";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const statistics = await prisma.statisticTypeDefinition.findMany({
    include: {
      statistics: true,
    },
  });
  res.status(200).json(statistics);
});

router.get("/types", async (req: Request, res: Response) => {
  const statistics = await prisma.statisticTypeDefinition.findMany({
    include: {
      statistics: {
        select: {
          value: true,
          sampleSize: true,
          device: {
            select: {
              name: true,
              deviceId: true,
            },
          },
        },
      },
    },
  });
  res.status(200).json(statistics);
});

router.post("/types", validateCreateStatistic, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const { name, description, unit } = req.body;

  const statisticType = await prisma.statisticTypeDefinition.create({
    data: {
      name,
      description,
      unit,
    },
  });

  res.status(201).json(statisticType);
});

router.patch(
  "/types/:id",
  validateUpdateStatistic,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const { id } = req.params;
    const { name, description, unit } = req.body;

    const statisticType = await prisma.statisticTypeDefinition.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        description,
        unit,
      },
    });

    res.status(200).json(statisticType);
  }
);

export default router;
