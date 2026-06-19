import type { Comment } from '@/entities/comment/model/types';
import { axiosClient } from '@/shared/api/axiosClient';

/** Creates a comment via multipart/form-data (supports optional file upload). */
export const createComment = async (formData: FormData): Promise<Comment> => {
  const { data } = await axiosClient.post<{ data: Comment }>(
    '/comments',
    formData,
  );

  return data.data;
};
