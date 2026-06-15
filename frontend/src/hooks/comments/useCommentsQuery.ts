import { useQuery } from '@tanstack/react-query';

import { getComments } from '@/features/comments/api/commentApi';
import { commentQueryKeys } from '@/features/comments/api/commentQueryKeys';
import type { GetCommentsParams } from '@/features/comments/types/comment';

/** Loads paginated comments with sorting. */
export const useCommentsQuery = (params: GetCommentsParams) =>
  useQuery({
    queryKey: commentQueryKeys.list(params),
    queryFn: () => getComments(params),
  });
