import { Router } from 'express';

import {
  createComment,
  getComments,
} from '../controllers/commentController.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createCommentSchema } from '../schemas/comment.schema.js';

const commentRoutes = Router();

commentRoutes.get('/', getComments);
commentRoutes.post('/', validateBody(createCommentSchema), createComment);

export default commentRoutes;
