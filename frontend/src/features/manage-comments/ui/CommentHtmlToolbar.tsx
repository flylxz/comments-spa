import type { CommentHtmlTag } from '@/features/manage-comments/lib/insertHtmlTag';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

type CommentHtmlToolbarProps = {
  disabled?: boolean;
  compact?: boolean;
  onInsertTag: (tag: CommentHtmlTag) => void;
};

const TOOLBAR_ITEMS: { tag: CommentHtmlTag; label: string }[] = [
  { tag: 'i', label: '[i]' },
  { tag: 'strong', label: '[strong]' },
  { tag: 'code', label: '[code]' },
  { tag: 'a', label: '[a]' },
];

export const CommentHtmlToolbar = ({
  disabled = false,
  compact = false,
  onInsertTag,
}: CommentHtmlToolbarProps) => (
  <div
    className={cn(
      'flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-border bg-muted px-2 py-1.5',
      compact && 'py-1',
    )}
    role="toolbar"
    aria-label="HTML formatting"
  >
    {TOOLBAR_ITEMS.map(({ tag, label }) => (
      <Button
        key={tag}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        className={cn(
          'h-7 px-2 font-mono text-xs',
          compact && 'h-6 px-1.5 text-[11px]',
        )}
        aria-label={`Insert ${tag} tag`}
        onClick={() => {
          onInsertTag(tag);
        }}
      >
        {label}
      </Button>
    ))}
  </div>
);
