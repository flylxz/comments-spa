declare module 'svg-captcha' {
  export interface CaptchaResult {
    text: string;
    data: string;
  }

  export interface CreateOptions {
    size?: number;
    ignoreChars?: string;
    noise?: number;
    color?: boolean;
    background?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    charPreset?: string;
    mathMin?: number;
    mathMax?: number;
    mathOperator?: string;
  }

  export function create(options?: CreateOptions): CaptchaResult;

  const svgCaptcha: {
    create: typeof create;
  };

  export default svgCaptcha;
}
