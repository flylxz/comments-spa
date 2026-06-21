import type {
  Comment,
  CreateCommentInput,
  PaginatedCommentsQuery,
  PaginatedCommentsResult,
} from '@comments-spa/shared';

import {
  ALLOWED_ANCHOR_SANITIZED_ATTRIBUTES,
  ALLOWED_COMMENT_TAGS,
  ALLOWED_LINK_SCHEMES,
  EXTERNAL_LINK_REL,
  EXTERNAL_LINK_TARGET,
  isExternalHttpLinkHref,
  LINK_SCHEME_ATTRIBUTES,
  validateCommentHtml,
} from '@comments-spa/shared';
import sanitizeHtml from 'sanitize-html';
import { FieldValidationError } from '../errors/fieldValidationError.js';
import {
  type CommentRepository,
  commentRepository,
} from '../repositories/commentRepository.js';
import { type CaptchaService, captchaService } from './captchaService.js';

const sanitizeCommentText = (text: string): string =>
  sanitizeHtml(text, {
    allowedTags: [...ALLOWED_COMMENT_TAGS],
    allowedAttributes: {
      a: [...ALLOWED_ANCHOR_SANITIZED_ATTRIBUTES],
    },
    allowedSchemes: [...ALLOWED_LINK_SCHEMES],
    allowedSchemesAppliedToAttributes: [...LINK_SCHEME_ATTRIBUTES],
    disallowedTagsMode: 'discard',
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';

        if (!isExternalHttpLinkHref(href)) {
          return { tagName, attribs };
        }

        return {
          tagName,
          attribs: {
            ...attribs,
            target: EXTERNAL_LINK_TARGET,
            rel: EXTERNAL_LINK_REL,
          },
        };
      },
    },
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

    const comment = await this.repository.createCommentRecord({
      userName: input.userName,
      email: input.email,
      homePage: input.homePage ?? null,
      text: sanitizeCommentText(input.text),
      fileUrl: input.fileUrl ?? null,
      fileName: input.fileName ?? null,
      fileSize: input.fileSize ?? null,
      parentId: input.parentId,
    });

    this.captcha.consumeCaptcha(input.captchaId);

    return comment;
  }
}

export const commentService = new CommentService(
  commentRepository,
  captchaService,
);
