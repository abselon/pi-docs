import { Router } from 'express';
import { z } from 'zod';
import { getPrisma } from '../db/prisma';
import { AppError } from '../lib/errors';
import { asyncHandler } from '../lib/http';
import { requireAuth } from '../middleware/auth';

export const categoriesRouter = Router();

categoriesRouter.get(
  '/categories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const categories = await prisma.category.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { documents: true } } },
    });
    res.json({
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        documentsCount: c._count.documents,
      })),
    });
  }),
);

categoriesRouter.post(
  '/categories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().min(1),
        icon: z.string().min(1).default('folder'),
      })
      .parse(req.body);

    const prisma = getPrisma();

    const existing = await prisma.category.findFirst({
      where: { userId: req.user!.id, name: body.name },
      select: { id: true },
    });
    if (existing) {
      throw new AppError({ status: 409, code: 'CATEGORY_EXISTS', message: 'Category name already exists' });
    }

    const category = await prisma.category.create({
      data: { userId: req.user!.id, name: body.name, icon: body.icon },
    });
    res.status(201).json({ category });
  }),
);

categoriesRouter.patch(
  '/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z
      .object({
        name: z.string().min(1).optional(),
        icon: z.string().min(1).optional(),
      })
      .parse(req.body);

    const prisma = getPrisma();
    const category = await prisma.category.findFirst({
      where: { id: params.id, userId: req.user!.id },
    });
    if (!category) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Category not found' });

    const updated = await prisma.category.update({
      where: { id: category.id },
      data: body,
    });
    res.json({ category: updated });
  }),
);

categoriesRouter.delete(
  '/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const prisma = getPrisma();

    const category = await prisma.category.findFirst({
      where: { id: params.id, userId: req.user!.id },
      select: { id: true },
    });
    if (!category) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Category not found' });

    await prisma.category.delete({ where: { id: category.id } });
    res.status(204).send();
  }),
);

