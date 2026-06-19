import DOMPurify from 'dompurify';

import { ALLOWED_COMMENT_TAGS } from '@/entities/comment/lib/validateCommentHtml';

export const sanitizeCommentHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_COMMENT_TAGS],
    ALLOWED_ATTR: ['href', 'title'],
  });
