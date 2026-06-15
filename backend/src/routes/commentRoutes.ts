import { Router } from 'express';

import {
  createComment,
  getComments,
} from '../controllers/commentController.js';
import {
  handleUpload,
  processUploadedFile,
} from '../middlewares/uploadMiddleware.js';
import { validateBody } from '../middlewares/validateBody.js';
import { validateQuery } from '../middlewares/validateQuery.js';
import {
  createCommentSchema,
  getCommentsQuerySchema,
} from '../schemas/comment.schema.js';

const commentRoutes = Router();

commentRoutes.get('/', validateQuery(getCommentsQuerySchema), getComments);
commentRoutes.post(
  '/',
  handleUpload,
  processUploadedFile,
  validateBody(createCommentSchema),
  createComment,
);

export default commentRoutes;
