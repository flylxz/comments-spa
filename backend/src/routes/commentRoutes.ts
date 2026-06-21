import {
  createCommentSchema,
  getCommentsQuerySchema,
} from '@comments-spa/shared';
import { Router } from 'express';

import {
  createComment,
  getComments,
} from '../controllers/commentController.js';
import {
  createCommentRateLimiter,
  getCommentsRateLimiter,
} from '../middlewares/rateLimiters.js';
import {
  handleUpload,
  processUploadedFile,
} from '../middlewares/uploadMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import { validateQuery } from '../middlewares/validateQuery.js';

const commentRoutes = Router();

commentRoutes.get(
  '/',
  getCommentsRateLimiter,
  validateQuery(getCommentsQuerySchema),
  getComments,
);

commentRoutes.post(
  '/',
  createCommentRateLimiter,
  handleUpload,
  processUploadedFile,
  validateBody(createCommentSchema),
  createComment,
);

export default commentRoutes;
