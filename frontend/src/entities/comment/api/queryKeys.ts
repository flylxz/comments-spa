import type { GetCommentsParams } from '@/entities/comment/model/types';

/** TanStack Query cache keys for the comment entity. */
export const commentQueryKeys = {
  all: ['comments'] as const,
  list: (params: GetCommentsParams) =>
    [...commentQueryKeys.all, 'list', params] as const,
};
