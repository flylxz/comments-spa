import rateLimit from 'express-rate-limit';

const rateLimitMessage = (message: string) => ({
  message,
});

export const captchaRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(
    'Too many captcha requests, please try again later',
  ),
});

export const createCommentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(
    'Too many comment submissions, please try again later',
  ),
});

export const getCommentsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage(
    'Too many comment list requests, please try again later',
  ),
});
