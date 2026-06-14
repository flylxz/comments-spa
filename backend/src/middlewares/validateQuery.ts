import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

const VALIDATED_QUERY_KEY = 'validatedQuery';

export const validateQuery =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(result.error);
      return;
    }

    res.locals[VALIDATED_QUERY_KEY] = result.data;
    next();
  };

export const getValidatedQuery = <T>(res: Response): T => {
  return res.locals[VALIDATED_QUERY_KEY] as T;
};
