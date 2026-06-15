import { axiosClient } from '@/api/axiosClient';
import type {
  CaptchaResponse,
  Comment,
  CreateCommentPayload,
  GetCommentsParams,
  PaginatedCommentsResponse,
} from '@/features/comments/types/comment';

/** Fetches a paginated, server-built comment tree. */
export const getComments = async (
  params: GetCommentsParams,
): Promise<PaginatedCommentsResponse> => {
  const { data } = await axiosClient.get<PaginatedCommentsResponse>(
    '/comments',
    { params },
  );

  return data;
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

/** Fetches a new captcha challenge for comment submission. */
export const getCaptcha = async (): Promise<CaptchaResponse> => {
  const { data } = await axiosClient.get<CaptchaResponse>('/captcha');

  return data;
};
