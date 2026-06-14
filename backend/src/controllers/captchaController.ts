import type { NextFunction, Request, Response } from 'express';

import * as captchaService from '../services/captchaService.js';

export const getCaptcha = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const captcha = captchaService.generateCaptcha();
    res.status(200).json(captcha);
  } catch (error) {
    next(error);
  }
};
