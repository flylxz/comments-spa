import { axiosClient } from '@/shared/api/axiosClient';

/** Raw captcha payload returned by GET /api/captcha. */
export type CaptchaApiResponse = {
  captchaId: string;
  captchaSvg: string;
};

/** Alternate API shape when the backend exposes `id` and `image` fields. */
export type CaptchaApiResponseAlt = {
  id: string;
  image: string;
};

/** Normalized captcha data consumed by the comment form. */
export type CaptchaData = {
  id: string;
  image: string;
};

const isAlternateCaptchaResponse = (
  data: CaptchaApiResponse | CaptchaApiResponseAlt,
): data is CaptchaApiResponseAlt => 'id' in data && 'image' in data;

const normalizeCaptchaResponse = (
  data: CaptchaApiResponse | CaptchaApiResponseAlt,
): CaptchaData => {
  if (isAlternateCaptchaResponse(data)) {
    return { id: data.id, image: data.image };
  }

  return { id: data.captchaId, image: data.captchaSvg };
};

/** Fetches a fresh captcha challenge from the backend. */
export const getCaptcha = async (): Promise<CaptchaData> => {
  const { data } = await axiosClient.get<
    CaptchaApiResponse | CaptchaApiResponseAlt
  >('/captcha');

  return normalizeCaptchaResponse(data);
};
