import DOMPurify from 'dompurify';

import { isExternalHttpLinkHref } from '@/entities/comment/lib/isAllowedLinkHref';
import { ALLOWED_COMMENT_TAGS } from '@/entities/comment/lib/validateCommentHtml';

const secureExternalLinksHook = (node: Element): void => {
  if (node.tagName !== 'A' || !node.hasAttribute('href')) {
    return;
  }

  const href = node.getAttribute('href') ?? '';

  if (!isExternalHttpLinkHref(href)) {
    return;
  }

  node.setAttribute('target', '_blank');
  node.setAttribute('rel', 'noopener noreferrer');
};

export const sanitizeCommentHtml = (html: string): string => {
  DOMPurify.addHook('afterSanitizeAttributes', secureExternalLinksHook);

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [...ALLOWED_COMMENT_TAGS],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):[^\s]*|)$/i,
    });
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes', secureExternalLinksHook);
  }
};
