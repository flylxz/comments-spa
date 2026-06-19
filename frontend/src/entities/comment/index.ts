export { useCommentsQuery } from './api/useCommentsQuery';

export { buildCommentTree } from './lib/buildCommentTree';
export { flattenComments } from './lib/flattenComments';
export { normalizeCommentTree } from './lib/normalizeCommentTree';
export type {
  Comment,
  GetCommentsParams,
  PaginatedCommentsResponse,
  SortField,
  SortOrder,
} from './model/types';
export type { CommentCardProps } from './ui/CommentCard';
export { CommentCard } from './ui/CommentCard';
export type { CommentTreeProps } from './ui/CommentTree';
export { CommentTree } from './ui/CommentTree';
