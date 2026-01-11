import { Router } from 'express';
import { z } from 'zod';
import { getPrisma } from '../db/prisma';
import { asyncHandler } from '../lib/http';
import { requireAuth } from '../middleware/auth';

export const settingsRouter = Router();

settingsRouter.get(
  '/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id },
      update: {},
    });
    res.json({ settings });
  }),
);

settingsRouter.patch(
  '/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        darkMode: z.boolean().optional(),
        biometricEnabled: z.boolean().optional(),
        autoLockMinutes: z.number().int().min(0).max(240).optional(),
        storageProvider: z.enum(['LOCAL', 'S3']).optional(),
      })
      .parse(req.body);

    const prisma = getPrisma();
    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id, ...body },
      update: body,
    });
    res.json({ settings });
  }),
);

