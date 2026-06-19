import { Lightbox } from 'lightbox3';

/** Bouncy preset from lightbox3 demo — low damping for visible spring overshoot. */
const LIGHTBOX_SPRING_OPEN = { stiffness: 200, damping: 10 } as const;
const LIGHTBOX_SPRING_CLOSE = { stiffness: 200, damping: 12 } as const;

export const initLightbox = (): void => {
  Lightbox.init({
    springOpen: LIGHTBOX_SPRING_OPEN,
    springClose: LIGHTBOX_SPRING_CLOSE,
    padding: 24,
  });
};
