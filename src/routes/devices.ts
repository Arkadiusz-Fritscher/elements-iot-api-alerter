import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { validationResult, param } from "express-validator";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const devices = await prisma.device.findMany({
    include: {
      statistic: {
        select: {
          sampleSize: true,
          value: true,
          updatedAt: true,
          type: {
            select: {
              name: true,
              unit: true,
              description: true,
            },
          },
        },
      },
    },
  });
  return res.status(200).json(devices);
});

router.get(
  "/:id",
  [param("id", "Ungültige Geräte-ID").isUUID().escape()],
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }

    const { id } = req.params;

    const device = await prisma.device.findUnique({
      where: {
        deviceId: id,
      },
    });

    return res.status(200).json(device);
  }
);

export default router;
