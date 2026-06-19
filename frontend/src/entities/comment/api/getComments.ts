import type {
  GetCommentsParams,
  PaginatedCommentsResponse,
} from '@/entities/comment/model/types';
import { axiosClient } from '@/shared/api/axiosClient';

/** Fetches a paginated comment list from the backend. */
export const getComments = async (
  params: GetCommentsParams,
): Promise<PaginatedCommentsResponse> => {
  const { data } = await axiosClient.get<PaginatedCommentsResponse>(
    '/comments',
    { params },
  );

  return data;
};
