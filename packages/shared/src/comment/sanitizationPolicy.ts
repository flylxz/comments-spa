/** Allowed href URI schemes for comment links. */
export const ALLOWED_LINK_SCHEMES = ['http', 'https', 'mailto'] as const;

/** Attributes users may set on `<a>` (matches validateCommentHtml). */
export const ALLOWED_ANCHOR_INPUT_ATTRIBUTES = ['href', 'title'] as const;

/** Attributes preserved on `<a>` after server-side sanitize-html. */
export const ALLOWED_ANCHOR_SANITIZED_ATTRIBUTES = [
  'href',
  'title',
  'target',
  'rel',
] as const;

/** Attributes checked for allowed URI schemes (sanitize-html). */
export const LINK_SCHEME_ATTRIBUTES = ['href'] as const;

/** DOMPurify ALLOWED_URI_REGEXP aligned with ALLOWED_LINK_SCHEMES. */
export const ALLOWED_LINK_URI_REGEXP = /^(?:(?:https?|mailto):[^\s]*|)$/i;

export const EXTERNAL_LINK_TARGET = '_blank';
export const EXTERNAL_LINK_REL = 'noopener noreferrer';
