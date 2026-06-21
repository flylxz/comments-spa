import { z } from 'zod';

import { CAPTCHA_ANSWER_PATTERN, USER_NAME_PATTERN } from './constants.js';
import { API_FIELD_MESSAGES } from './messages.js';

export type RequiredStringMessages = {
  required: string;
};

export type UserNameFieldMessages = RequiredStringMessages & {
  pattern: string;
};

export type EmailFieldMessages = RequiredStringMessages & {
  invalid: string;
};

export type CaptchaAnswerFieldMessages = RequiredStringMessages & {
  pattern: string;
};

export type HomePageApiFieldMessages = {
  invalid: string;
};

export const createUserNameFieldSchema = (
  messages: UserNameFieldMessages,
): z.ZodString =>
  z
    .string({ required_error: messages.required })
    .min(1, messages.required)
    .regex(USER_NAME_PATTERN, messages.pattern);

export const createEmailFieldSchema = (
  messages: EmailFieldMessages,
): z.ZodString =>
  z
    .string({ required_error: messages.required })
    .min(1, messages.required)
    .email(messages.invalid);

export const createTextFieldSchema = (
  messages: RequiredStringMessages,
): z.ZodString =>
  z.string({ required_error: messages.required }).min(1, messages.required);

export const createCaptchaIdFieldSchema = (
  messages: RequiredStringMessages,
): z.ZodString =>
  z.string({ required_error: messages.required }).min(1, messages.required);

export const createCaptchaAnswerFieldSchema = (
  messages: CaptchaAnswerFieldMessages,
): z.ZodString =>
  z
    .string({ required_error: messages.required })
    .min(1, messages.required)
    .regex(CAPTCHA_ANSWER_PATTERN, messages.pattern);

export const createHomePageApiFieldSchema = (
  messages: HomePageApiFieldMessages,
): z.ZodOptional<z.ZodNullable<z.ZodString>> =>
  z.string().url(messages.invalid).nullable().optional();

export const createHomePageFormFieldSchema = (): z.ZodOptional<
  z.ZodUnion<[z.ZodLiteral<''>, z.ZodString]>
> => z.union([z.literal(''), z.string().url()]).optional();

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
