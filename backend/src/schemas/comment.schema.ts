import { z } from 'zod';

export const createCommentSchema = z.object({
  userName: z
    .string({ required_error: 'userName is required' })
    .min(1, 'userName is required')
    .regex(/^[a-zA-Z0-9]+$/, 'userName must contain only letters and numbers'),
  email: z
    .string({ required_error: 'email is required' })
    .min(1, 'email is required')
    .email('email must be a valid email address'),
  homePage: z
    .string()
    .url('homePage must be a valid URL')
    .nullable()
    .optional(),
  captchaId: z
    .string({ required_error: 'captchaId is required' })
    .min(1, 'captchaId is required'),
  captchaAnswer: z
    .string({ required_error: 'captchaAnswer is required' })
    .min(1, 'captchaAnswer is required'),
  text: z
    .string({ required_error: 'text is required' })
    .min(1, 'text is required'),
  parentId: z.number().int().positive().optional(),
});

export const getCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sortBy: z.enum(['userName', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
export type GetCommentsQuerySchema = z.infer<typeof getCommentsQuerySchema>;
