/** Allowed HTML tags in comment text (XSS policy). */
export const ALLOWED_COMMENT_TAGS = ['a', 'code', 'i', 'strong'] as const;

/** Allowed file extensions for comment attachments. */
export const ALLOWED_FILE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.gif',
  '.png',
  '.txt',
] as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
] as const;

export const ALLOWED_UPLOAD_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  'text/plain',
] as const;

/** Max TXT attachment size (100 KB). */
export const MAX_TXT_FILE_SIZE_BYTES = 100 * 1024;

/** Max upload size enforced by multer (5 MB). */
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

/** Image resize bounds applied server-side via sharp. */
export const MAX_IMAGE_WIDTH = 320;
export const MAX_IMAGE_HEIGHT = 240;

/** Max lengths for comment form fields (DoS / storage bounds). */
export const MAX_USER_NAME_LENGTH = 64;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_HOME_PAGE_LENGTH = 2048;
export const MAX_COMMENT_TEXT_LENGTH = 10_000;

export const USER_NAME_PATTERN = /^[a-zA-Z0-9]+$/;

export const CAPTCHA_ANSWER_PATTERN = /^[a-zA-Z0-9]+$/;

export const CAPTCHA_ANSWER_ERROR_MESSAGE =
  'captchaAnswer must contain only letters and numbers';

export const CAPTCHA_CHAR_PRESET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');

  if (dotIndex === -1) {
    return '';
  }

  return fileName.slice(dotIndex).toLowerCase();
};

/** Platform-agnostic file metadata check (name, MIME, size). */
export const isAllowedFileMeta = (
  fileName: string,
  mimeType: string,
  sizeBytes: number,
): boolean => {
  const extension = getFileExtension(fileName);

  if (
    !ALLOWED_FILE_EXTENSIONS.includes(
      extension as (typeof ALLOWED_FILE_EXTENSIONS)[number],
    )
  ) {
    return false;
  }

  if (extension === '.txt') {
    if (mimeType !== 'text/plain' && mimeType !== '') {
      return false;
    }

    return sizeBytes <= MAX_TXT_FILE_SIZE_BYTES;
  }

  return ALLOWED_IMAGE_MIME_TYPES.includes(
    mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
  );
};
