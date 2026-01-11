import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  // In development, log emails to console instead of sending
  if (env.NODE_ENV === 'development' && !env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    return transporter;
  }

  if (!env.SMTP_HOST) {
    // eslint-disable-next-line no-console
    console.warn('SMTP_HOST not configured. Email sending disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) {
    // In development, log email to console
    if (env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('\n=== EMAIL (not sent - SMTP not configured) ===');
      // eslint-disable-next-line no-console
      console.log(`To: ${options.to}`);
      // eslint-disable-next-line no-console
      console.log(`Subject: ${options.subject}`);
      // eslint-disable-next-line no-console
      console.log(`\n${options.text || options.html}\n`);
      // eslint-disable-next-line no-console
      console.log('==========================================\n');
    }
    return;
  }

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export function generateEmailVerificationEmail(token: string, name: string): { subject: string; html: string; text: string } {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  return {
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify your email address</h1>
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
    text: `
Hi ${name},

Thank you for signing up! Please verify your email address by visiting this link:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
    `.trim(),
  };
}

export function generatePasswordResetEmail(token: string, name: string): { subject: string; html: string; text: string } {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  return {
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset your password</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
    text: `
Hi ${name},

We received a request to reset your password. Visit this link to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
    `.trim(),
  };
}
