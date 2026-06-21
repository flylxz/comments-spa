export {
  ALLOWED_COMMENT_TAGS,
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_UPLOAD_MIME_TYPES,
  CAPTCHA_ANSWER_ERROR_MESSAGE,
  CAPTCHA_ANSWER_PATTERN,
  CAPTCHA_CHAR_PRESET,
  getFileExtension,
  isAllowedFileMeta,
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
  MAX_TXT_FILE_SIZE_BYTES,
  MAX_UPLOAD_SIZE_BYTES,
  USER_NAME_PATTERN,
} from './comment/constants.js';

export type {
  CaptchaAnswerFieldMessages,
  EmailFieldMessages,
  HomePageApiFieldMessages,
  RequiredStringMessages,
  UserNameFieldMessages,
} from './comment/fieldSchemas.js';

export {
  createCaptchaAnswerFieldSchema,
  createCaptchaIdFieldSchema,
  createEmailFieldSchema,
  createHomePageApiFieldSchema,
  createHomePageFormFieldSchema,
  createParentIdApiFieldSchema,
  createParentIdFormFieldSchema,
  createTextFieldSchema,
  createUserNameFieldSchema,
  emailFieldSchema,
  textFieldSchema,
  userNameFieldSchema,
} from './comment/fieldSchemas.js';

export {
  isAllowedLinkHref,
  isExternalHttpLinkHref,
} from './comment/isAllowedLinkHref.js';
export { API_FIELD_MESSAGES, FORM_FIELD_MESSAGES } from './comment/messages.js';

export * from './comment/sanitizationPolicy.js';

export type {
  CreateCommentSchema,
  GetCommentsQuerySchema,
} from './comment/schemas.js';

export {
  createCommentSchema,
  getCommentsQuerySchema,
} from './comment/schemas.js';

export type {
  Comment,
  CommentSortField,
  CommentSortFieldConfig,
  CommentSortOrder,
  CreateCommentInput,
  GetCommentsParams,
  PaginatedCommentsQuery,
  PaginatedCommentsResponse,
  PaginatedCommentsResult,
  SortField,
  SortOrder,
} from './comment/types.js';

export { validateCommentHtml } from './comment/validateCommentHtml.js';
