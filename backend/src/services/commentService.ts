import sanitizeHtml from 'sanitize-html';
import { FieldValidationError } from '../errors/fieldValidationError.js';
import { validateCommentHtml } from '../lib/validateCommentHtml.js';
import {
  type CommentRepository,
  commentRepository,
} from '../repositories/commentRepository.js';
import type {
  Comment,
  CreateCommentInput,
  PaginatedCommentsQuery,
  PaginatedCommentsResult,
} from '../types/comment.interface.js';
import { type CaptchaService, captchaService } from './captchaService.js';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong'] as const;

const sanitizeCommentText = (text: string): string =>
  sanitizeHtml(text, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    disallowedTagsMode: 'discard',
  });

export class CommentService {
  constructor(
    private readonly repository: CommentRepository,
    private readonly captcha: CaptchaService,
  ) {}

  async getComments(
    query: PaginatedCommentsQuery,
  ): Promise<PaginatedCommentsResult> {
    return this.repository.findTopLevelComments(query);
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    this.captcha.verifyCaptcha({
      captchaId: input.captchaId,
      captchaAnswer: input.captchaAnswer,
    });

    const htmlValidationError = validateCommentHtml(input.text);

    if (htmlValidationError !== null) {
      throw new FieldValidationError('text', htmlValidationError);
    }

    return this.repository.createCommentRecord({
      userName: input.userName,
      email: input.email,
      homePage: input.homePage ?? null,
      text: sanitizeCommentText(input.text),
      fileUrl: input.fileUrl ?? null,
      fileName: input.fileName ?? null,
      fileSize: input.fileSize ?? null,
      parentId: input.parentId,
    });
  }
}

export const commentService = new CommentService(
  commentRepository,
  captchaService,
);
