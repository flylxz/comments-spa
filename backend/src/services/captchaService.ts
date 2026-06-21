import { CAPTCHA_CHAR_PRESET } from '@comments-spa/shared';
import jwt from 'jsonwebtoken';
import svgCaptcha from 'svg-captcha';
import { FieldValidationError } from '../errors/fieldValidationError.js';
import { getJwtSecret } from '../lib/env.js';
import type {
  CaptchaJwtPayload,
  CaptchaResponse,
  VerifyCaptchaInput,
} from '../types/captcha.interface.js';

const CAPTCHA_TOKEN_EXPIRES_IN = '3m' as const;
const CAPTCHA_ERROR_MESSAGE = 'Incorrect or expired captcha';

const isCaptchaJwtPayload = (
  payload: unknown,
): payload is CaptchaJwtPayload => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const answer: unknown = Reflect.get(payload, 'answer');

  return typeof answer === 'string';
};

export class CaptchaService {
  generateCaptcha(): CaptchaResponse {
    const captcha = svgCaptcha.create({
      charPreset: CAPTCHA_CHAR_PRESET,
    });
    const jwtSecret = getJwtSecret();
    const captchaId = jwt.sign({ answer: captcha.text }, jwtSecret, {
      expiresIn: CAPTCHA_TOKEN_EXPIRES_IN,
    });

    return {
      captchaSvg: captcha.data,
      captchaId,
    };
  }

  verifyCaptcha(input: VerifyCaptchaInput): void {
    const jwtSecret = getJwtSecret();
    let payload: unknown;

    try {
      payload = jwt.verify(input.captchaId, jwtSecret);
    } catch {
      throw new FieldValidationError('captchaAnswer', CAPTCHA_ERROR_MESSAGE);
    }

    if (!isCaptchaJwtPayload(payload)) {
      throw new FieldValidationError('captchaAnswer', CAPTCHA_ERROR_MESSAGE);
    }

    if (payload.answer.toLowerCase() !== input.captchaAnswer.toLowerCase()) {
      throw new FieldValidationError('captchaAnswer', CAPTCHA_ERROR_MESSAGE);
    }
  }
}

export const captchaService = new CaptchaService();
