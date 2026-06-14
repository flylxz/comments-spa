export interface CaptchaResponse {
  captchaSvg: string;
  captchaId: string;
}

export interface VerifyCaptchaInput {
  captchaId: string;
  captchaAnswer: string;
}

export interface CaptchaJwtPayload {
  answer: string;
}
