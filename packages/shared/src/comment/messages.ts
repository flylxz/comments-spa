import {
  CAPTCHA_ANSWER_ERROR_MESSAGE,
  MAX_COMMENT_TEXT_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_HOME_PAGE_LENGTH,
  MAX_USER_NAME_LENGTH,
} from './constants.js';

export const API_FIELD_MESSAGES = {
  userName: {
    required: 'userName is required',
    pattern: 'userName must contain only letters and numbers',
    tooLong: `userName must be at most ${MAX_USER_NAME_LENGTH} characters`,
  },
  email: {
    required: 'email is required',
    invalid: 'email must be a valid email address',
    tooLong: `email must be at most ${MAX_EMAIL_LENGTH} characters`,
  },
  text: {
    required: 'text is required',
    tooLong: `text must be at most ${MAX_COMMENT_TEXT_LENGTH} characters`,
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
    schemeInvalid: 'homePage must be a valid http or https URL',
    tooLong: `homePage must be at most ${MAX_HOME_PAGE_LENGTH} characters`,
  },
} as const;

export const FORM_FIELD_MESSAGES = {
  userName: {
    required: 'Username is required',
    pattern: 'Username must contain only letters and numbers',
    tooLong: `Username must be at most ${MAX_USER_NAME_LENGTH} characters`,
  },
  email: {
    required: 'Email is required',
    invalid: 'Email must be a valid email address',
    tooLong: `Email must be at most ${MAX_EMAIL_LENGTH} characters`,
  },
  text: {
    required: 'Comment text is required',
    tooLong: `Comment must be at most ${MAX_COMMENT_TEXT_LENGTH} characters`,
  },
  captchaId: {
    required: 'Captcha is required',
  },
  captchaAnswer: {
    required: 'Captcha answer is required',
    pattern: 'Captcha answer must contain only letters and numbers',
  },
  homePage: {
    invalid: 'Homepage must be a valid URL',
    schemeInvalid: 'Homepage must be a valid http or https URL',
    tooLong: `Homepage must be at most ${MAX_HOME_PAGE_LENGTH} characters`,
  },
} as const;
