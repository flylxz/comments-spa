import type { NextFunction, Request, Response } from 'express';

import type { CreateCommentSchema } from '../schemas/comment.schema.js';
import * as commentService from '../services/commentService.js';

export const getComments = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const comments = commentService.getAllComments();
    res.status(200).json({ data: comments });
  } catch (error) {
    next(error);
  }
};

export const createComment = (
  req: Request<object, object, CreateCommentSchema>,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const comment = commentService.createComment(req.body);
    res.status(201).json({ data: comment });
  } catch (error) {
    next(error);
  }
};
