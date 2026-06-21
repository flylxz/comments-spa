import {
  createCaptchaAnswerFieldSchema,
  createCaptchaIdFieldSchema,
  createEmailFieldSchema,
  createHomePageFormFieldSchema,
  createParentIdFormFieldSchema,
  createTextFieldSchema,
  createUserNameFieldSchema,
  FORM_FIELD_MESSAGES,
  isAllowedFileMeta,
  validateCommentHtml,
} from '@comments-spa/shared';
import { z } from 'zod';

/** Client-side validation for the comment submission form. */
export const commentFormSchema = z.object({
  userName: createUserNameFieldSchema(FORM_FIELD_MESSAGES.userName),
  email: createEmailFieldSchema(FORM_FIELD_MESSAGES.email),
  homePage: createHomePageFormFieldSchema(FORM_FIELD_MESSAGES.homePage),
  captchaId: createCaptchaIdFieldSchema(FORM_FIELD_MESSAGES.captchaId),
  captchaValue: createCaptchaAnswerFieldSchema(
    FORM_FIELD_MESSAGES.captchaAnswer,
  ),
  text: createTextFieldSchema(FORM_FIELD_MESSAGES.text).superRefine(
    (value, context) => {
      const htmlError = validateCommentHtml(value);

      if (htmlError !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: htmlError,
        });
      }
    },
  ),
  parentId: createParentIdFormFieldSchema(),
  file: z
    .instanceof(File)
    .optional()
    .refine(
      (file) =>
        file === undefined ||
        isAllowedFileMeta(file.name, file.type, file.size),
      'Allowed formats: JPG, JPEG, GIF, PNG, TXT',
    ),
});

export type CommentFormValues = z.infer<typeof commentFormSchema>;
