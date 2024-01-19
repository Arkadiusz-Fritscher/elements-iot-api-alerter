import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { validationResult, param } from "express-validator";
import { initiateDeviceReadings } from "../services/readingsModule";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response) => {
  const devices = await prisma.device.findMany({
    include: {
      statistics: true,
    },
  });
  return res.status(200).json(devices);
});

router.get(
  "/:id",
  [param("id", "Ungültige Geräte-ID").isUUID().escape()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400);
        return next(new Error(errors.array()[0].msg));
      }

      const { id } = req.params;

      const device = await prisma.device.findUnique({
        where: {
          id: id,
        },
      });

      return res.status(200).json(device);
    } catch (error) {
      return next(error);
    }
  }
);

router.get(
  "/:id/readings/initiate",
  [
    param("id")
      .isUUID()
      .withMessage("Ungültige Geräte-ID")
      .escape()
      .custom((value) => {
        return prisma.device
          .findUnique({
            where: {
              id: value,
            },
          })
          .then((device) => {
            if (!device) {
              return Promise.reject("Kein Gerät mit dieser ID vorhanden");
            }
          });
      }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(400);
        return next(new Error(errors.array()[0].msg));
      }

      const { id } = req.params;

      const readingsResult = await initiateDeviceReadings(id);

      return res
        .status(200)
        .json({ status: "success", message: `Initiated ${readingsResult?.count} readings for device ${id}` });
    } catch (error) {
      return next(error);
    }
  }
);

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const device = await prisma.device.update({
      where: {
        id: id,
      },
      data: body,
    });

    return res.status(200).json(device);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(500).json({
        message: "Ein Fehler ist aufgetreten",
      });
    }
    // return next(new Error(error));
    return res.status(500).json({
      message: "something went wrong",
    });
  }
});

export default router;
