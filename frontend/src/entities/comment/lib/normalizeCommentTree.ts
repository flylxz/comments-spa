import type { Comment } from '@/entities/comment/model/types';

import { buildCommentTree } from './buildCommentTree';
import { flattenComments } from './flattenComments';
import { sanitizeCommentHtml } from './sanitizeCommentHtml';

const withSanitizedText = (comments: Comment[]): Comment[] =>
  comments.map((comment) => ({
    ...comment,
    sanitizedText: sanitizeCommentHtml(comment.text),
    replies: comment.replies ? withSanitizedText(comment.replies) : undefined,
  }));

/** Accepts flat or nested comments and returns a consistent, render-ready tree. */
export const normalizeCommentTree = (comments: Comment[]): Comment[] =>
  withSanitizedText(buildCommentTree(flattenComments(comments)));
