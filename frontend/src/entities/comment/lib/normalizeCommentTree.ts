import type { Comment } from '@/entities/comment/model/types';

import { buildCommentTree } from './buildCommentTree';
import { flattenComments } from './flattenComments';

/** Accepts flat or nested comments and returns a consistent tree. */
export const normalizeCommentTree = (comments: Comment[]): Comment[] =>
  buildCommentTree(flattenComments(comments));
