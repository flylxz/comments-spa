import { CAPTCHA_ANSWER_ERROR_MESSAGE } from './constants.js';

export const API_FIELD_MESSAGES = {
  userName: {
    required: 'userName is required',
    pattern: 'userName must contain only letters and numbers',
  },
  email: {
    required: 'email is required',
    invalid: 'email must be a valid email address',
  },
  text: {
    required: 'text is required',
  },
  captchaId: {
    required: 'captchaId is required',
  },
  captchaAnswer: {
    required: 'captchaAnswer is required',
    pattern: CAPTCHA_ANSWER_ERROR_MESSAGE,
  },
  homePage: {
    invalid: 'homePage must be a valid URL',
  },
} as const;

export const FORM_FIELD_MESSAGES = {
  userName: {
    required: 'Username is required',
    pattern: 'Username must contain only letters and numbers',
  },
  email: {
    required: 'Email is required',
    invalid: 'Email must be a valid email address',
  },
  text: {
    required: 'Comment text is required',
  },
  captchaId: {
    required: 'Captcha is required',
  },
  captchaAnswer: {
    required: 'Captcha answer is required',
    pattern: 'Captcha answer must contain only letters and numbers',
  },
} as const;
