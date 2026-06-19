import axios from 'axios';

import type { CommentFormValues } from '@/features/manage-comments/model/validation';

type FieldValidationErrorPayload = {
  field: string;
  message: string;
};

const isFieldValidationErrorPayload = (
  data: unknown,
): data is FieldValidationErrorPayload =>
  typeof data === 'object' &&
  data !== null &&
  'field' in data &&
  'message' in data &&
  typeof data.field === 'string' &&
  typeof data.message === 'string';

/** Maps backend field names to react-hook-form field names. */
const serverFieldToFormField: Partial<Record<string, keyof CommentFormValues>> =
  {
    captchaAnswer: 'captchaValue',
  };

const formFieldKeys = new Set<keyof CommentFormValues>([
  'userName',
  'email',
  'homePage',
  'captchaId',
  'captchaValue',
  'text',
  'parentId',
  'file',
]);

const resolveFormField = (
  serverField: string,
): keyof CommentFormValues | null => {
  const mappedField = serverFieldToFormField[serverField];

  if (mappedField !== undefined) {
    return mappedField;
  }

  if (formFieldKeys.has(serverField as keyof CommentFormValues)) {
    return serverField as keyof CommentFormValues;
  }

  return null;
};

/** Extracts a single field validation error from a failed API response. */
export const parseFieldValidationError = (
  error: unknown,
): { formField: keyof CommentFormValues; message: string } | null => {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) {
    return null;
  }

  const payload = error.response.data;

  if (!isFieldValidationErrorPayload(payload)) {
    return null;
  }

  const formField = resolveFormField(payload.field);

  if (formField === null) {
    return null;
  }

  return { formField, message: payload.message };
};
