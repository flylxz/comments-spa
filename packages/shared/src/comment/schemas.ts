import { z } from 'zod';

import {
  createCaptchaAnswerFieldSchema,
  createCaptchaIdFieldSchema,
  createEmailFieldSchema,
  createHomePageApiFieldSchema,
  createParentIdApiFieldSchema,
  createTextFieldSchema,
  createUserNameFieldSchema,
} from './fieldSchemas.js';
import { API_FIELD_MESSAGES } from './messages.js';

export const createCommentSchema = z.object({
  userName: createUserNameFieldSchema(API_FIELD_MESSAGES.userName),
  email: createEmailFieldSchema(API_FIELD_MESSAGES.email),
  homePage: createHomePageApiFieldSchema(API_FIELD_MESSAGES.homePage),
  captchaId: createCaptchaIdFieldSchema(API_FIELD_MESSAGES.captchaId),
  captchaAnswer: createCaptchaAnswerFieldSchema(
    API_FIELD_MESSAGES.captchaAnswer,
  ),
  text: createTextFieldSchema(API_FIELD_MESSAGES.text),
  parentId: createParentIdApiFieldSchema(),
});

export const getCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sortBy: z.enum(['userName', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;
export type GetCommentsQuerySchema = z.infer<typeof getCommentsQuerySchema>;
