import { Router } from 'express';
import { getPrisma } from '../db/prisma';
import { asyncHandler } from '../lib/http';
import { requireAuth } from '../middleware/auth';

export const statsRouter = Router();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

statsRouter.get(
  '/stats/overview',
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const now = new Date();
    const soon = addDays(now, 30);

    const [total, expired, expiring] = await Promise.all([
      prisma.document.count({ where: { userId: req.user!.id } }),
      prisma.document.count({ where: { userId: req.user!.id, expiresAt: { lte: now } } }),
      prisma.document.count({ where: { userId: req.user!.id, expiresAt: { gt: now, lte: soon } } }),
    ]);

    const active = Math.max(0, total - expired - expiring);
    res.json({ overview: { total, active, expiring } });
  }),
);

