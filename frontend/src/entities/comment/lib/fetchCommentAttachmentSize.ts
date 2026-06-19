const sizeCache = new Map<string, number | null>();
const pendingRequests = new Map<string, Promise<number | null>>();

/** Returns a cached attachment size when available. */
export const getCachedCommentAttachmentSize = (
  resolvedUrl: string,
): number | null | undefined => {
  if (!sizeCache.has(resolvedUrl)) {
    return undefined;
  }

  return sizeCache.get(resolvedUrl) ?? null;
};

/** Fetches attachment size via HEAD with in-memory deduplication. */
export const fetchCommentAttachmentSize = async (
  resolvedUrl: string,
): Promise<number | null> => {
  if (sizeCache.has(resolvedUrl)) {
    return sizeCache.get(resolvedUrl) ?? null;
  }

  const pending = pendingRequests.get(resolvedUrl);

  if (pending) {
    return pending;
  }

  const request = (async (): Promise<number | null> => {
    try {
      const response = await fetch(resolvedUrl, { method: 'HEAD' });

      if (!response.ok) {
        sizeCache.set(resolvedUrl, null);
        return null;
      }

      const contentLength = response.headers.get('Content-Length');

      if (!contentLength) {
        sizeCache.set(resolvedUrl, null);
        return null;
      }

      const bytes = Number.parseInt(contentLength, 10);

      if (!Number.isFinite(bytes)) {
        sizeCache.set(resolvedUrl, null);
        return null;
      }

      sizeCache.set(resolvedUrl, bytes);
      return bytes;
    } catch {
      sizeCache.set(resolvedUrl, null);
      return null;
    } finally {
      pendingRequests.delete(resolvedUrl);
    }
  })();

  pendingRequests.set(resolvedUrl, request);

  return request;
};
