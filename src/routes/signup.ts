import express, { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient, Prisma } from '@prisma/client';
import { validateSignup } from '../middlewares/validationMiddlewares';
import { generateTokenObject } from '../../backups/utils';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', validateSignup, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    return next(new Error(errors.array()[0].msg));
  }

  const { email, password, username } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const token = generateTokenObject(user);

    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      token,
    });
  } catch (error: any) {
    let msg = error.message || 'Unbekannter Fehler';

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(400);
        msg = new Error('Nutzername oder E-Mail-Adresse bereits vergeben');
      }
    }

    next(msg);
  }
});

export default router;
