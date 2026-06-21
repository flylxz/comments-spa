import { randomUUID } from 'node:crypto';

import { CAPTCHA_CHAR_PRESET } from '@comments-spa/shared';
import jwt from 'jsonwebtoken';
import svgCaptcha from 'svg-captcha';
import { FieldValidationError } from '../errors/fieldValidationError.js';
import { CaptchaStore } from '../lib/captchaStore.js';
import { getJwtSecret } from '../lib/env.js';
import type {
  CaptchaJwtPayload,
  CaptchaResponse,
  VerifyCaptchaInput,
} from '../types/captcha.interface.js';

const CAPTCHA_TOKEN_EXPIRES_IN = '3m' as const;
const CAPTCHA_TTL_MS = 3 * 60 * 1000;
const CAPTCHA_ERROR_MESSAGE = 'Incorrect or expired captcha';

const isCaptchaJwtPayload = (
  payload: unknown,
): payload is CaptchaJwtPayload => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const id: unknown = Reflect.get(payload, 'id');

  return typeof id === 'string' && id.length > 0;
};

export class CaptchaService {
  constructor(private readonly store: CaptchaStore) {}

  generateCaptcha(): CaptchaResponse {
    const captcha = svgCaptcha.create({
      charPreset: CAPTCHA_CHAR_PRESET,
    });
    const id = randomUUID();
    const jwtSecret = getJwtSecret();

    this.store.set(id, captcha.text);

    const captchaId = jwt.sign({ id }, jwtSecret, {
      expiresIn: CAPTCHA_TOKEN_EXPIRES_IN,
    });

    return {
      captchaSvg: captcha.data,
      captchaId,
    };
  }

  verifyCaptcha(input: VerifyCaptchaInput): void {
    const id = this.extractCaptchaId(input.captchaId);
    const storedAnswer = this.store.get(id);

    if (storedAnswer === null) {
      throw new FieldValidationError('captchaAnswer', CAPTCHA_ERROR_MESSAGE);
    }

    if (storedAnswer.toLowerCase() !== input.captchaAnswer.toLowerCase()) {
      throw new FieldValidationError('captchaAnswer', CAPTCHA_ERROR_MESSAGE);
    }
  }

  consumeCaptcha(captchaId: string): void {
    const id = this.extractCaptchaId(captchaId);
    this.store.delete(id);
  }

  private extractCaptchaId(captchaId: string): string {
    const jwtSecret = getJwtSecret();
    let payload: unknown;

    try {
      payload = jwt.verify(captchaId, jwtSecret);
    } catch {
      throw new FieldValidationError('captchaAnswer', CAPTCHA_ERROR_MESSAGE);
    }

    if (!isCaptchaJwtPayload(payload)) {
      throw new FieldValidationError('captchaAnswer', CAPTCHA_ERROR_MESSAGE);
    }

    return payload.id;
  }
}

export const captchaService = new CaptchaService(
  new CaptchaStore(CAPTCHA_TTL_MS),
);
