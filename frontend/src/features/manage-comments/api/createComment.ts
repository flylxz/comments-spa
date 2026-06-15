import type { Comment } from '@/entities/comment/model/types';
import { axiosClient } from '@/shared/api/axiosClient';

export type CreateCommentPayload = {
  userName: string;
  email: string;
  homePage?: string | null;
  captchaId: string;
  captchaAnswer: string;
  text: string;
  parentId?: number;
  file?: File;
};

/** Creates a comment via multipart/form-data (supports optional file upload). */
export const createComment = async (
  payload: CreateCommentPayload,
): Promise<Comment> => {
  const formData = new FormData();

  formData.append('userName', payload.userName);
  formData.append('email', payload.email);
  formData.append('captchaId', payload.captchaId);
  formData.append('captchaAnswer', payload.captchaAnswer);
  formData.append('text', payload.text);

  if (payload.homePage != null && payload.homePage.length > 0) {
    formData.append('homePage', payload.homePage);
  }

  if (payload.parentId !== undefined) {
    formData.append('parentId', String(payload.parentId));
  }

  if (payload.file) {
    formData.append('file', payload.file);
  }

  const { data } = await axiosClient.post<{ data: Comment }>(
    '/comments',
    formData,
  );

  return data.data;
};
