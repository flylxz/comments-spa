import { useQuery } from '@tanstack/react-query';

import { getComments } from '@/entities/comment/api/getComments';
import { commentQueryKeys } from '@/entities/comment/api/queryKeys';
import type { GetCommentsParams } from '@/entities/comment/model/types';

/** Loads paginated comments with sorting. */
export const useCommentsQuery = (params: GetCommentsParams) =>
  useQuery({
    queryKey: commentQueryKeys.list(params),
    queryFn: () => getComments(params),
  });
