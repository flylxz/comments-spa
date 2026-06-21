const SCROLL_TOP_OFFSET_PX = 24;
const VIEWPORT_BOTTOM_PADDING_PX = 24;

export const getCommentElementId = (commentId: number): string =>
  `comment-${commentId}`;

export const getReplyFormElementId = (commentId: number): string =>
  `reply-form-${commentId}`;

/** Waits for reply-form exit / list refetch layout before scrolling. */
export const SCROLL_LAYOUT_SETTLE_MS = 200;

type ViewportRect = {
  top: number;
  bottom: number;
};

const getViewportBounds = (): ViewportRect => ({
  top: SCROLL_TOP_OFFSET_PX,
  bottom: window.innerHeight - VIEWPORT_BOTTOM_PADDING_PX,
});

const isRectFullyVisible = (rect: DOMRect, viewport: ViewportRect): boolean =>
  rect.top >= viewport.top && rect.bottom <= viewport.bottom;

const scrollElementIntoView = (element: HTMLElement): void => {
  const top =
    element.getBoundingClientRect().top + window.scrollY - SCROLL_TOP_OFFSET_PX;

  window.scrollTo({ top, behavior: 'smooth' });
};

export const scrollToComment = (commentId: number): boolean => {
  const element = document.getElementById(getCommentElementId(commentId));

  if (element === null) {
    return false;
  }

  scrollElementIntoView(element);

  return true;
};

/**
 * Scrolls only when the reply form is clipped by the viewport.
 * Keeps the parent comment visible by capping scroll when moving down.
 */
export const scrollToReplyFormIfObscured = (commentId: number): boolean => {
  const formElement = document.getElementById(getReplyFormElementId(commentId));

  if (formElement === null) {
    return false;
  }

  const viewport = getViewportBounds();
  const formRect = formElement.getBoundingClientRect();

  if (isRectFullyVisible(formRect, viewport)) {
    return false;
  }

  let targetScrollY = window.scrollY;

  if (formRect.bottom > viewport.bottom) {
    targetScrollY += formRect.bottom - viewport.bottom;
  }

  if (formRect.top < viewport.top) {
    targetScrollY += formRect.top - viewport.top;
  }

  const commentElement = document.getElementById(
    getCommentElementId(commentId),
  );

  if (commentElement !== null && targetScrollY > window.scrollY) {
    const commentRect = commentElement.getBoundingClientRect();
    const maxScrollY = window.scrollY + commentRect.top - SCROLL_TOP_OFFSET_PX;
    targetScrollY = Math.min(targetScrollY, maxScrollY);
  }

  if (Math.abs(targetScrollY - window.scrollY) < 1) {
    return false;
  }

  window.scrollTo({ top: targetScrollY, behavior: 'smooth' });

  return true;
};
