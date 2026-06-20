import { cn } from '@/shared/lib/utils';

/** Shared focus ring, cursor, and transition for clickable elements. */
export const interactiveFocus =
  'cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Matches `Button` variant="ghost" hover surface. */
export const interactiveGhostHover =
  'hover:bg-foreground/12 hover:text-foreground';

/** Inline text links inside content areas. */
export const interactiveTextLink = 'hover:text-primary hover:underline';

/** Square icon control (permalink, header actions). */
export const interactiveIconButton = cn(
  interactiveFocus,
  interactiveGhostHover,
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground',
);

/** Full-width panel toggle (e.g. collapsible form header). */
export const interactivePanelTrigger = cn(
  interactiveFocus,
  interactiveGhostHover,
  'flex w-full items-center justify-between gap-2 rounded-md py-0.5 text-left',
);

/** Sortable table header control. */
export const interactiveSortTrigger = cn(
  interactiveFocus,
  interactiveGhostHover,
  'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-muted-foreground',
);

/** Table data row hover. */
export const interactiveTableRow = 'transition-colors hover:bg-muted/30';

/** Bordered file/download chip. */
export const interactiveFileChip = cn(
  interactiveFocus,
  'rounded-md border border-border bg-muted/30 hover:border-foreground/20 hover:bg-foreground/12',
);

/** Native select hover, aligned with outline controls. */
export const interactiveSelectHover = 'hover:bg-foreground/12';

/** Active/selected state for sortable header buttons. */
export const interactiveSortTriggerActive = 'bg-foreground/8 text-foreground';
