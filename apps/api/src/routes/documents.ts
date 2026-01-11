import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { getPrisma } from '../db/prisma';
import { AppError } from '../lib/errors';
import { asyncHandler } from '../lib/http';
import { requireAuth } from '../middleware/auth';
import { DocumentStatus } from '@prisma/client';
import { getStorage } from '../storage';

export const documentsRouter = Router();

function computeStatus(expiresAt: Date | undefined) {
  if (!expiresAt) return DocumentStatus.ACTIVE;
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 30);
  if (expiresAt <= now) return DocumentStatus.EXPIRED;
  if (expiresAt <= soon) return DocumentStatus.EXPIRING;
  return DocumentStatus.ACTIVE;
}

const upload = multer({ storage: multer.memoryStorage() });

documentsRouter.get(
  '/documents',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = z
      .object({
        categoryId: z.string().uuid().optional(),
        search: z.string().optional(),
      })
      .parse(req.query);

    const prisma = getPrisma();
    const docs = await prisma.document.findMany({
      where: {
        userId: req.user!.id,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ documents: docs });
  }),
);

documentsRouter.post(
  '/documents',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        title: z.string().min(1),
        description: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        issuedAt: z.coerce.date().optional(),
        expiresAt: z.coerce.date().optional(),
      })
      .parse(req.body);

    const prisma = getPrisma();

    if (body.categoryId) {
      const cat = await prisma.category.findFirst({ where: { id: body.categoryId, userId: req.user!.id } });
      if (!cat) throw new AppError({ status: 400, code: 'BAD_CATEGORY', message: 'Invalid categoryId' });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id },
      update: {},
      select: { storageProvider: true },
    });

    const file = req.file;
    const stored =
      file && file.buffer
        ? await getStorage(settings.storageProvider).putObject({
            userId: req.user!.id,
            originalName: file.originalname,
            mimeType: file.mimetype,
            bytes: file.buffer,
          })
        : null;

    const doc = await prisma.document.create({
      data: {
        userId: req.user!.id,
        categoryId: body.categoryId,
        title: body.title,
        description: body.description,
        issuedAt: body.issuedAt,
        expiresAt: body.expiresAt,
        status: computeStatus(body.expiresAt),
        fileName: file?.originalname,
        fileMime: file?.mimetype,
        fileSize: file?.size,
        storageProvider: stored?.provider ?? 'LOCAL',
        storageKey: stored?.key,
      },
    });

    res.status(201).json({ document: doc });
  }),
);

documentsRouter.get(
  '/documents/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const prisma = getPrisma();
    const doc = await prisma.document.findFirst({ where: { id: params.id, userId: req.user!.id } });
    if (!doc) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Document not found' });
    res.json({ document: doc });
  }),
);

documentsRouter.patch(
  '/documents/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = z
      .object({
        title: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        categoryId: z.string().uuid().optional().nullable(),
        issuedAt: z.coerce.date().optional().nullable(),
        expiresAt: z.coerce.date().optional().nullable(),
      })
      .parse(req.body);

    const prisma = getPrisma();
    const doc = await prisma.document.findFirst({ where: { id: params.id, userId: req.user!.id } });
    if (!doc) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Document not found' });

    if (body.categoryId) {
      const cat = await prisma.category.findFirst({ where: { id: body.categoryId, userId: req.user!.id } });
      if (!cat) throw new AppError({ status: 400, code: 'BAD_CATEGORY', message: 'Invalid categoryId' });
    }

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        title: body.title,
        description: body.description === null ? null : body.description,
        categoryId: body.categoryId === null ? null : body.categoryId,
        issuedAt: body.issuedAt === null ? null : body.issuedAt,
        expiresAt: body.expiresAt === null ? null : body.expiresAt,
        ...(typeof body.expiresAt !== 'undefined'
          ? { status: computeStatus(body.expiresAt === null ? undefined : body.expiresAt) }
          : {}),
      },
    });
    res.json({ document: updated });
  }),
);

documentsRouter.get(
  '/documents/:id/download',
  requireAuth,
  asyncHandler(async (req, res) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const prisma = getPrisma();
    const doc = await prisma.document.findFirst({ where: { id: params.id, userId: req.user!.id } });
    if (!doc) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Document not found' });
    if (!doc.storageKey) throw new AppError({ status: 404, code: 'NO_FILE', message: 'No file attached' });

    const storage = getStorage(doc.storageProvider);
    const out = await storage.getObjectBytes({ key: doc.storageKey });
    const contentType = out.mimeType ?? doc.fileMime ?? 'application/octet-stream';
    res.setHeader('content-type', contentType);
    const filename = doc.fileName ?? 'document';
    res.setHeader('content-disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
    res.send(out.bytes);
  }),
);

documentsRouter.delete(
  '/documents/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const params = z.object({ id: z.string().uuid() }).parse(req.params);
    const prisma = getPrisma();
    const doc = await prisma.document.findFirst({ where: { id: params.id, userId: req.user!.id } });
    if (!doc) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'Document not found' });

    if (doc.storageKey) {
      await getStorage(doc.storageProvider)
        .deleteObject({ key: doc.storageKey })
        .catch(() => undefined);
    }

    await prisma.document.delete({ where: { id: doc.id } });
    res.status(204).send();
  }),
);

