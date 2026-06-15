import type { GetCommentsParams } from '@/features/comments/types/comment';

/** TanStack Query cache keys for the comments domain. */
export const commentQueryKeys = {
  all: ['comments'] as const,
  /** Scoped list key including pagination and sort params. */
  list: (params: GetCommentsParams) =>
    [...commentQueryKeys.all, 'list', params] as const,
};
