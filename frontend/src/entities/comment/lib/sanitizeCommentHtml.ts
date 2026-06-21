import {
  ALLOWED_ANCHOR_INPUT_ATTRIBUTES,
  ALLOWED_COMMENT_TAGS,
  ALLOWED_LINK_URI_REGEXP,
  EXTERNAL_LINK_REL,
  EXTERNAL_LINK_TARGET,
  isExternalHttpLinkHref,
} from '@comments-spa/shared';
import DOMPurify from 'dompurify';

const secureExternalLinksHook = (node: Element): void => {
  if (node.tagName !== 'A' || !node.hasAttribute('href')) {
    return;
  }

  const href = node.getAttribute('href') ?? '';

  if (!isExternalHttpLinkHref(href)) {
    return;
  }

  node.setAttribute('target', EXTERNAL_LINK_TARGET);
  node.setAttribute('rel', EXTERNAL_LINK_REL);
};

export const sanitizeCommentHtml = (html: string): string => {
  DOMPurify.addHook('afterSanitizeAttributes', secureExternalLinksHook);

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [...ALLOWED_COMMENT_TAGS],
      ALLOWED_ATTR: [...ALLOWED_ANCHOR_INPUT_ATTRIBUTES],
      ALLOWED_URI_REGEXP: ALLOWED_LINK_URI_REGEXP,
    });
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes', secureExternalLinksHook);
  }
};
