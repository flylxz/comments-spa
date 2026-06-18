import { useQuery } from '@tanstack/react-query';

import { getCaptcha } from '@/features/manage-comments/api/getCaptcha';

/** TanStack Query cache keys for captcha requests. */
export const captchaQueryKeys = {
  all: ['captcha'] as const,
};

/** Loads the current captcha challenge for the comment form. */
export const useCaptchaQuery = () =>
  useQuery({
    queryKey: captchaQueryKeys.all,
    queryFn: getCaptcha,
    staleTime: 0,
    gcTime: 0,
  });
