import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { getPrisma } from '../db/prisma';
import { AppError } from '../lib/errors';
import { asyncHandler } from '../lib/http';
import { issueToken, requireAuth } from '../middleware/auth';
import { sendEmail, generateEmailVerificationEmail, generatePasswordResetEmail } from '../lib/email';

export const authRouter = Router();

function handlePrismaError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const target = (err.meta as { target?: string[] })?.target;
      if (target?.includes('email')) {
        throw new AppError({ status: 409, code: 'EMAIL_IN_USE', message: 'Email is already registered' });
      }
      throw new AppError({ status: 409, code: 'DUPLICATE_ENTRY', message: 'A record with this value already exists' });
    }
    // Database connection errors
    if (err.code === 'P1001' || err.code === 'P1008' || err.code === 'P1017') {
      throw new AppError({
        status: 503,
        code: 'DATABASE_ERROR',
        message: 'Database connection error. Please check your DATABASE_URL configuration.',
        details: err.message,
      });
    }
    // Timeout
    if (err.code === 'P1008') {
      throw new AppError({ status: 504, code: 'DATABASE_TIMEOUT', message: 'Database operation timed out' });
    }
    // Generic Prisma error
    throw new AppError({
      status: 500,
      code: 'DATABASE_ERROR',
      message: `Database error: ${err.message}`,
      details: err.code,
    });
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    throw new AppError({
      status: 500,
      code: 'DATABASE_INIT_ERROR',
      message: 'Failed to initialize database connection. Please check your DATABASE_URL.',
      details: err.message,
    });
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    throw new AppError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
      details: err.message,
    });
  }
  // Re-throw if not a Prisma error
  throw err;
}

authRouter.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    try {
      const body = z
        .object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(1).default('User'),
        })
        .parse(req.body);

      const prisma = getPrisma();

      let existing;
      try {
        existing = await prisma.user.findUnique({ where: { email: body.email } });
      } catch (err) {
        handlePrismaError(err);
      }

      if (existing) {
        throw new AppError({ status: 409, code: 'EMAIL_IN_USE', message: 'Email is already registered' });
      }

      const passwordHash = await bcrypt.hash(body.password, 10);
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date();
      emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

      let user;
      try {
        user = await prisma.user.create({
          data: {
            email: body.email,
            name: body.name,
            passwordHash,
            emailVerificationToken,
            emailVerificationExpires,
            settings: { create: {} },
            categories: {
              create: [
                { name: 'Personal IDs', icon: 'id-card' },
                { name: 'Financial', icon: 'bank' },
                { name: 'Medical', icon: 'medical' },
                { name: 'Education', icon: 'graduation-cap' },
                { name: 'Insurance', icon: 'shield' },
                { name: 'Legal', icon: 'gavel' },
              ],
            },
          },
          select: { id: true, email: true, name: true, emailVerified: true },
        });
      } catch (err) {
        handlePrismaError(err);
      }

      // Send verification email
      try {
        const emailContent = generateEmailVerificationEmail(emailVerificationToken, body.name);
        await sendEmail({
          to: body.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });
      } catch (emailErr) {
        // Log error but don't fail registration
        // eslint-disable-next-line no-console
        console.error('Failed to send verification email:', emailErr);
      }

      const token = issueToken(user.id);
      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      handlePrismaError(err);
    }
  }),
);

authRouter.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    try {
      const body = z
        .object({
          email: z.string().email(),
          password: z.string().min(1),
        })
        .parse(req.body);

      const prisma = getPrisma();
      let user;
      try {
        user = await prisma.user.findUnique({ where: { email: body.email } });
      } catch (err) {
        handlePrismaError(err);
      }

      if (!user) {
        throw new AppError({ status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      }

      const ok = await bcrypt.compare(body.password, user.passwordHash);
      if (!ok) {
        throw new AppError({ status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      }

      const token = issueToken(user.id);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      handlePrismaError(err);
    }
  }),
);

authRouter.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, emailVerified: true },
    });
    if (!user) throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'User not found' });
    res.json({ user });
  }),
);

// Logout endpoint (mostly for client-side token clearing, but provides a consistent API)
authRouter.post(
  '/auth/logout',
  requireAuth,
  asyncHandler(async (_req, res) => {
    // Since we're using JWT tokens, logout is primarily client-side
    // This endpoint exists for consistency and potential future token blacklisting
    res.json({ message: 'Logged out successfully' });
  }),
);

// Send email verification
authRouter.post(
  '/auth/send-verification',
  requireAuth,
  asyncHandler(async (req, res) => {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!user) {
      throw new AppError({ status: 404, code: 'NOT_FOUND', message: 'User not found' });
    }

    if (user.emailVerified) {
      throw new AppError({ status: 400, code: 'ALREADY_VERIFIED', message: 'Email is already verified' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(emailVerificationExpires.getHours() + 24);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    try {
      const emailContent = generateEmailVerificationEmail(emailVerificationToken, user.name);
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailErr) {
      // eslint-disable-next-line no-console
      console.error('Failed to send verification email:', emailErr);
      throw new AppError({
        status: 500,
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send verification email',
      });
    }

    res.json({ message: 'Verification email sent' });
  }),
);

// Verify email
authRouter.post(
  '/auth/verify-email',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        token: z.string().min(1),
      })
      .parse(req.body);

    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: body.token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError({
        status: 400,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired verification token',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    res.json({ message: 'Email verified successfully' });
  }),
);

// Request password reset
authRouter.post(
  '/auth/forgot-password',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        email: z.string().email(),
      })
      .parse(req.body);

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, name: true },
    });

    // Don't reveal if email exists or not (security best practice)
    if (!user) {
      res.json({ message: 'If the email exists, a password reset link has been sent' });
      return;
    }

    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = new Date();
    passwordResetExpires.setHours(passwordResetExpires.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    try {
      const emailContent = generatePasswordResetEmail(passwordResetToken, user.name);
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailErr) {
      // eslint-disable-next-line no-console
      console.error('Failed to send password reset email:', emailErr);
      throw new AppError({
        status: 500,
        code: 'EMAIL_SEND_FAILED',
        message: 'Failed to send password reset email',
      });
    }

    res.json({ message: 'If the email exists, a password reset link has been sent' });
  }),
);

// Reset password
authRouter.post(
  '/auth/reset-password',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        token: z.string().min(1),
        password: z.string().min(8),
      })
      .parse(req.body);

    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: body.token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError({
        status: 400,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired password reset token',
      });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({ message: 'Password reset successfully' });
  }),
);