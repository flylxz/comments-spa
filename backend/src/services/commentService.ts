import sanitizeHtml from 'sanitize-html';
import { FieldValidationError } from '../errors/fieldValidationError.js';
import { validateCommentHtml } from '../lib/validateCommentHtml.js';
import * as commentRepository from '../repositories/commentRepository.js';
import type {
  Comment,
  CreateCommentInput,
  PaginatedCommentsQuery,
  PaginatedCommentsResult,
} from '../types/comment.interface.js';
import * as captchaService from './captchaService.js';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong'] as const;

const sanitizeCommentText = (text: string): string =>
  sanitizeHtml(text, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    disallowedTagsMode: 'discard',
  });

export const getComments = async (
  query: PaginatedCommentsQuery,
): Promise<PaginatedCommentsResult> =>
  commentRepository.findTopLevelComments(query);

export const createComment = async (
  input: CreateCommentInput,
): Promise<Comment> => {
  captchaService.verifyCaptcha({
    captchaId: input.captchaId,
    captchaAnswer: input.captchaAnswer,
  });

  const htmlValidationError = validateCommentHtml(input.text);

  if (htmlValidationError !== null) {
    throw new FieldValidationError('text', htmlValidationError);
  }

  return commentRepository.createCommentRecord({
    userName: input.userName,
    email: input.email,
    homePage: input.homePage ?? null,
    text: sanitizeCommentText(input.text),
    fileUrl: input.fileUrl ?? null,
    parentId: input.parentId,
  });
};
