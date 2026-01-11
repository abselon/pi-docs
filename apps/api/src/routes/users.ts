import { Router } from 'express';
import { z } from 'zod';
import { getPrisma } from '../db/prisma';
import { AppError } from '../lib/errors';
import { asyncHandler } from '../lib/http';
import { requireAuth } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.get(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, emailVerified: true, createdAt: true },
    });
    if (!user) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'User not found' });
    res.json({ user });
  }),
);

usersRouter.patch(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().min(1).optional(),
      })
      .parse(req.body);

    const prisma = getPrisma();
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: body,
      select: { id: true, email: true, name: true, emailVerified: true, createdAt: true },
    });
    res.json({ user });
  }),
);

