import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { validationResult, param } from 'express-validator';
// import {
//   validateCreateStatisticType,
//   validateUpdateStatisticType,
//   validateCreateStatistic,
// } from "../middlewares/validationMiddlewares";

const router = express.Router();
const prisma = new PrismaClient();

//  /statistics
// router.get("/", async (req: Request, res: Response) => {
//   const statistics = await prisma.statistic.findMany({
//     include: {
//       type: {
//         select: {
//           name: true,
//           unit: true,
//           description: true,
//         },
//       },
//     },
//   });
//   res.status(200).json(statistics);
// });

// //  /statistics
// router.post("/", validateCreateStatistic, async (req: Request, res: Response, next: NextFunction) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res.status(400);
//     return next(new Error(errors.array()[0].msg));
//   }

//   const { value, sampleSize, deviceId, typeId } = req.body as Prisma.StatisticCreateInput & {
//     deviceId: string;
//     typeId: number;
//   };

//   const statistic = await prisma.statistic.create({
//     data: {
//       value,
//       sampleSize,
//       device: {
//         connect: {
//           id: deviceId,
//         },
//       },
//       type: {
//         connect: {
//           id: typeId,
//         },
//       },
//     },
//   });

//   res.status(201).json(statistic);
// });

// //  /statistics/types
// router.get("/types", async (req: Request, res: Response) => {
//   const statistics = await prisma.statisticTypeDefinition.findMany({
//     include: {
//       statistics: {
//         select: {
//           value: true,
//           sampleSize: true,
//           device: {
//             select: {
//               name: true,
//               id: true,
//             },
//           },
//         },
//       },
//     },
//   });
//   res.status(200).json(statistics);
// });

// router.post(
//   "/types",
//   validateCreateStatisticType,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.status(400);
//       return next(new Error(errors.array()[0].msg));
//     }

//     const { name, description, unit } = req.body as Prisma.StatisticTypeDefinitionCreateInput;

//     const statisticType = await prisma.statisticTypeDefinition.create({
//       data: {
//         name,
//         description,
//         unit,
//       },
//     });

//     res.status(201).json(statisticType);
//   }
// );

// router.patch(
//   "/types/:id",
//   validateUpdateStatisticType,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.status(400);
//       return next(new Error(errors.array()[0].msg));
//     }

//     const { id } = req.params;
//     const { name, description, unit } = req.body;

//     const statisticType = await prisma.statisticTypeDefinition.update({
//       where: {
//         id: Number(id),
//       },
//       data: {
//         name,
//         description,
//         unit,
//       },
//     });

//     res.status(200).json(statisticType);
//   }
// );

export default router;
