import { env } from '@/config/env';

/** Resolves a backend-relative upload path to an absolute URL. */
export const resolveFileUrl = (fileUrl: string | null): string | null => {
  if (fileUrl === null) {
    return null;
  }

  if (fileUrl.startsWith('https://') || fileUrl.startsWith('http://')) {
    return fileUrl;
  }

  return new URL(fileUrl, env.apiOrigin).href;
};
