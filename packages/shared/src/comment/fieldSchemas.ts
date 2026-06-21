import { z } from 'zod';

import {
  CAPTCHA_ANSWER_PATTERN,
  MAX_COMMENT_TEXT_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_HOME_PAGE_LENGTH,
  MAX_USER_NAME_LENGTH,
  USER_NAME_PATTERN,
} from './constants.js';
import { isAllowedHomePageUrl } from './isAllowedLinkHref.js';
import { API_FIELD_MESSAGES } from './messages.js';

export type RequiredStringMessages = {
  required: string;
};

export type BoundedStringMessages = RequiredStringMessages & {
  tooLong: string;
};

export type UserNameFieldMessages = BoundedStringMessages & {
  pattern: string;
};

export type EmailFieldMessages = BoundedStringMessages & {
  invalid: string;
};

export type CaptchaAnswerFieldMessages = RequiredStringMessages & {
  pattern: string;
};

export type HomePageFieldMessages = {
  invalid: string;
  schemeInvalid: string;
  tooLong: string;
};

export type HomePageApiFieldMessages = HomePageFieldMessages;

export const createUserNameFieldSchema = (
  messages: UserNameFieldMessages,
): z.ZodString =>
  z
    .string({ required_error: messages.required })
    .min(1, messages.required)
    .max(MAX_USER_NAME_LENGTH, messages.tooLong)
    .regex(USER_NAME_PATTERN, messages.pattern);

export const createEmailFieldSchema = (
  messages: EmailFieldMessages,
): z.ZodString =>
  z
    .string({ required_error: messages.required })
    .min(1, messages.required)
    .max(MAX_EMAIL_LENGTH, messages.tooLong)
    .email(messages.invalid);

export function createTextFieldSchema(
  messages: BoundedStringMessages,
): z.ZodString {
  return z
    .string({ required_error: messages.required })
    .min(1, messages.required)
    .max(MAX_COMMENT_TEXT_LENGTH, messages.tooLong);
}

export const createCaptchaIdFieldSchema = (
  messages: RequiredStringMessages,
): z.ZodString => {
  return z
    .string({ required_error: messages.required })
    .min(1, messages.required);
};

export const createCaptchaAnswerFieldSchema = (
  messages: CaptchaAnswerFieldMessages,
): z.ZodString =>
  z
    .string({ required_error: messages.required })
    .min(1, messages.required)
    .regex(CAPTCHA_ANSWER_PATTERN, messages.pattern);

export const createHomePageApiFieldSchema = (
  messages: HomePageApiFieldMessages,
) =>
  z
    .string()
    .max(MAX_HOME_PAGE_LENGTH, messages.tooLong)
    .url(messages.invalid)
    .refine(isAllowedHomePageUrl, messages.schemeInvalid)
    .nullable()
    .optional();

export const createHomePageFormFieldSchema = (
  messages: HomePageFieldMessages,
) =>
  z
    .union([
      z.literal(''),
      z
        .string()
        .max(MAX_HOME_PAGE_LENGTH, messages.tooLong)
        .url(messages.invalid)
        .refine(isAllowedHomePageUrl, messages.schemeInvalid),
    ])
    .optional();

export const createParentIdApiFieldSchema = (): z.ZodOptional<z.ZodNumber> =>
  z.coerce.number().int().positive().optional();

export const createParentIdFormFieldSchema = (): z.ZodOptional<z.ZodNumber> =>
  z.number().int().positive().optional();

export const userNameFieldSchema = createUserNameFieldSchema(
  API_FIELD_MESSAGES.userName,
);

export const emailFieldSchema = createEmailFieldSchema(
  API_FIELD_MESSAGES.email,
);

export const textFieldSchema = createTextFieldSchema(API_FIELD_MESSAGES.text);
