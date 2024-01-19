import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      firstName: true,
      lastName: true,
      lastLogin: true,
    },
  });
  res.status(200).json(users);
});

export default router;
