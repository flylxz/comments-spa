import type { NextFunction, Request, Response } from 'express';
import { getValidatedQuery } from '../middlewares/validateQuery.js';
import type {
  CreateCommentSchema,
  GetCommentsQuerySchema,
} from '../schemas/comment.schema.js';
import * as commentService from '../services/commentService.js';
import { emitNewComment } from '../services/websocketService.js';

export const getComments = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, sortBy, sortOrder } =
      getValidatedQuery<GetCommentsQuerySchema>(res);
    const result = await commentService.getComments({
      page,
      sortBy,
      sortOrder,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createComment = async (
  req: Request<object, object, CreateCommentSchema>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const comment = await commentService.createComment({
      ...req.body,
      fileUrl: req.uploadedFileUrl ?? null,
      fileName: req.uploadedFileName ?? null,
      fileSize: req.uploadedFileSize ?? null,
    });
    emitNewComment(comment);
    res.status(201).json({ data: comment });
  } catch (error) {
    next(error);
  }
};
