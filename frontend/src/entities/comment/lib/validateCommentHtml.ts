export const ALLOWED_COMMENT_TAGS = ['a', 'code', 'i', 'strong'] as const;

type AllowedCommentTag = (typeof ALLOWED_COMMENT_TAGS)[number];

const ALLOWED_TAG_SET = new Set<string>(ALLOWED_COMMENT_TAGS);

const TAG_PATTERN = /<(\/?)([a-z]+)\b([^>]*?)(\/?)>|<([^>]+)>/gi;

const isAllowedTag = (tagName: string): tagName is AllowedCommentTag =>
  ALLOWED_TAG_SET.has(tagName);

const parseAnchorAttributes = (
  attributesPart: string,
): { valid: true } | { valid: false; message: string } => {
  const attributePattern = /\s+(href|title)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let match: RegExpExecArray | null = attributePattern.exec(attributesPart);

  while (match !== null) {
    const attributeName = match[1];

    if (attributeName === 'href') {
      const hrefValue = (match[2] ?? match[3] ?? '').trim().toLowerCase();

      if (
        hrefValue.startsWith('javascript:') ||
        hrefValue.startsWith('data:')
      ) {
        return { valid: false, message: 'Link href is not allowed' };
      }
    }

    match = attributePattern.exec(attributesPart);
  }

  const disallowedAttributePattern = /\s+([a-zA-Z_:][\w:.-]*)\s*=/g;
  let disallowedMatch: RegExpExecArray | null =
    disallowedAttributePattern.exec(attributesPart);

  while (disallowedMatch !== null) {
    const attributeName = disallowedMatch[1]?.toLowerCase();

    if (attributeName !== 'href' && attributeName !== 'title') {
      return {
        valid: false,
        message: `Disallowed attribute on <a>: ${attributeName}`,
      };
    }

    disallowedMatch = disallowedAttributePattern.exec(attributesPart);
  }

  return { valid: true };
};

const validatePlainSegment = (segment: string): string | null => {
  if (segment.includes('<')) {
    return 'Invalid HTML: unescaped "<" in text (use allowed tags only)';
  }

  return null;
};

export const validateCommentHtml = (text: string): string | null => {
  const openTags: AllowedCommentTag[] = [];
  let lastIndex = 0;

  TAG_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null = TAG_PATTERN.exec(text);

  while (match !== null) {
    const plainSegment = text.slice(lastIndex, match.index);
    const plainError = validatePlainSegment(plainSegment);

    if (plainError !== null) {
      return plainError;
    }

    if (match[5] !== undefined) {
      return 'Invalid HTML: malformed tag';
    }

    const isClosingTag = match[1] === '/';
    const tagName = match[2]?.toLowerCase() ?? '';
    const attributesPart = match[3] ?? '';
    const isSelfClosing = match[4] === '/';

    if (!isAllowedTag(tagName)) {
      return `Disallowed tag: <${tagName}>`;
    }

    if (isSelfClosing) {
      return `Tag <${tagName}> must use an opening and closing pair`;
    }

    if (isClosingTag) {
      const expectedTag = openTags.pop();

      if (expectedTag === undefined || expectedTag !== tagName) {
        return `Mismatched closing tag: </${tagName}>`;
      }
    } else {
      if (tagName === 'a') {
        const attributeValidation = parseAnchorAttributes(attributesPart);

        if (!attributeValidation.valid) {
          return attributeValidation.message;
        }
      } else if (attributesPart.trim().length > 0) {
        return `Tag <${tagName}> must not have attributes`;
      }

      openTags.push(tagName);
    }

    lastIndex = match.index + match[0].length;
    match = TAG_PATTERN.exec(text);
  }

  const trailingPlain = text.slice(lastIndex);
  const trailingError = validatePlainSegment(trailingPlain);

  if (trailingError !== null) {
    return trailingError;
  }

  if (openTags.length > 0) {
    return `Unclosed tag: <${openTags[openTags.length - 1]}>`;
  }

  return null;
};
