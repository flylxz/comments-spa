import { z } from 'zod';

/** Mirrors backend uploadMiddleware allowed extensions. */
const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.gif',
  '.png',
  '.txt',
] as const;

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
] as const;

/** Matches backend MAX_TXT_SIZE_BYTES (100 KB). */
const MAX_TXT_FILE_SIZE_BYTES = 100 * 1024;

const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');

  if (dotIndex === -1) {
    return '';
  }

  return fileName.slice(dotIndex).toLowerCase();
};

const isAllowedFile = (file: File): boolean => {
  const extension = getFileExtension(file.name);

  if (
    !ALLOWED_FILE_EXTENSIONS.includes(
      extension as (typeof ALLOWED_FILE_EXTENSIONS)[number],
    )
  ) {
    return false;
  }

  if (extension === '.txt') {
    return file.type === 'text/plain' || file.type === '';
  }

  return ALLOWED_IMAGE_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
  );
};

/** Client-side validation for the comment submission form. */
export const commentFormSchema = z.object({
  userName: z
    .string()
    .min(1, 'Username is required')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must contain only letters and numbers'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Email must be a valid email address'),
  homePage: z.union([z.literal(''), z.string().url()]).optional(),
  captchaId: z.string().min(1, 'Captcha is required'),
  captchaValue: z.string().min(1, 'Captcha answer is required'),
  text: z.string().min(1, 'Comment text is required'),
  parentId: z.number().int().positive().optional(),
  file: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => file === undefined || isAllowedFile(file),
      'Allowed formats: JPG, JPEG, GIF, PNG, TXT',
    )
    .refine(
      (file) =>
        file === undefined ||
        getFileExtension(file.name) !== '.txt' ||
        file.size <= MAX_TXT_FILE_SIZE_BYTES,
      'TXT file size must not exceed 100 KB',
    ),
});

export type CommentFormValues = z.infer<typeof commentFormSchema>;
