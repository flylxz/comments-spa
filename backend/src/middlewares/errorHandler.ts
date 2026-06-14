import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client.js';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2003') {
      res.status(400).json({
        message: 'Invalid parentId: parent comment does not exist',
      });
      return;
    }
  }

  if (error instanceof ZodError) {
    const fieldErrors = error.errors.reduce<Record<string, string[]>>(
      (acc, issue) => {
        const field = issue.path.join('.') || 'body';
        if (!acc[field]) {
          acc[field] = [];
        }
        acc[field].push(issue.message);
        return acc;
      },
      {},
    );

    res.status(400).json({
      message: 'Validation failed',
      errors: fieldErrors,
    });
    return;
  }

  if (error instanceof Error) {
    const appError = error as AppError;
    const statusCode = appError.statusCode ?? 500;

    res.status(statusCode).json({
      message: appError.message || 'Internal Server Error',
    });
    return;
  }

  res.status(500).json({ message: 'Internal Server Error' });
};
