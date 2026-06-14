import { randomUUID } from 'node:crypto';
import sanitizeHtml from 'sanitize-html';

import type {
  Comment,
  CreateCommentInput,
} from '../types/comment.interface.js';

const comments: Comment[] = [];

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong'] as const;

const sanitizeCommentText = (text: string): string =>
  sanitizeHtml(text, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    disallowedTagsMode: 'discard',
  });

export const getAllComments = (): Comment[] => [...comments];

export const createComment = (input: CreateCommentInput): Comment => {
  const comment: Comment = {
    id: randomUUID(),
    userName: input.userName,
    email: input.email,
    homePage: input.homePage ?? null,
    captchaId: input.captchaId,
    text: sanitizeCommentText(input.text),
    createdAt: new Date().toISOString(),
  };

  comments.push(comment);

  return comment;
};
