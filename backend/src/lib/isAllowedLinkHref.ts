const EXTERNAL_LINK_PREFIXES = ['http://', 'https://'] as const;

const HOSTNAME_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

const isValidHttpHostname = (hostname: string): boolean => {
  if (hostname.length === 0) {
    return false;
  }

  if (hostname === 'localhost') {
    return true;
  }

  if (hostname.startsWith('[')) {
    return hostname.endsWith(']') && hostname.length > 2;
  }

  if (!/^[a-z0-9.-]+$/i.test(hostname) || hostname.includes('..')) {
    return false;
  }

  const labels = hostname.split('.');

  if (labels.length < 2) {
    return false;
  }

  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      HOSTNAME_LABEL_PATTERN.test(label),
  );
};

const isValidMailtoHref = (href: string): boolean => {
  try {
    const url = new URL(href);

    if (url.protocol !== 'mailto:') {
      return false;
    }

    return url.pathname.includes('@');
  } catch {
    return false;
  }
};

const isValidHttpHref = (href: string): boolean => {
  try {
    const url = new URL(href);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    if (url.username !== '' || url.password !== '') {
      return false;
    }

    return isValidHttpHostname(url.hostname);
  } catch {
    return false;
  }
};

/** http(s) links that should open in a new tab with noopener noreferrer. */
export const isExternalHttpLinkHref = (href: string): boolean => {
  const lower = href.trim().toLowerCase();

  return EXTERNAL_LINK_PREFIXES.some((prefix) => lower.startsWith(prefix));
};

/** Whitelist href schemes for comment links: http, https, mailto; empty href allowed. */
export const isAllowedLinkHref = (href: string): boolean => {
  const trimmed = href.trim();

  if (trimmed.length === 0) {
    return true;
  }

  const lower = trimmed.toLowerCase();

  if (lower.startsWith('mailto:')) {
    return isValidMailtoHref(trimmed);
  }

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return isValidHttpHref(trimmed);
  }

  return false;
};
