export { useCommentsQuery } from './api/useCommentsQuery';
export { buildCommentTree } from './lib/buildCommentTree';
export { getNextSortParams } from './lib/commentSort';
export { countCommentReplies } from './lib/countCommentReplies';
export { flattenComments } from './lib/flattenComments';
export { formatCommentDate } from './lib/formatCommentDate';
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
export type { CommentPaginationProps } from './ui/CommentPagination';
export { CommentPagination } from './ui/CommentPagination';
export type { CommentSortControlsProps } from './ui/CommentSortControls';
export { CommentSortControls } from './ui/CommentSortControls';
export type { CommentTreeProps } from './ui/CommentTree';
export { CommentTree } from './ui/CommentTree';
