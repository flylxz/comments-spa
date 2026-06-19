import { env } from '@/shared/config/env';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.gif', '.png'] as const;

export const isCommentImageAttachment = (fileUrl: string): boolean => {
  const lower = fileUrl.toLowerCase();

  return IMAGE_EXTENSIONS.some((extension) => lower.endsWith(extension));
};

export const resolveCommentFileUrl = (fileUrl: string): string => {
  if (/^https?:\/\//.test(fileUrl)) {
    return fileUrl;
  }

  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;

  return `${env.apiOrigin}${path}`;
};
