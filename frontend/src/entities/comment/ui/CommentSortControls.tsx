import { ArrowDown, ArrowUp } from 'lucide-react';

import type { SortField, SortOrder } from '@/entities/comment/model/types';
import { cn } from '@/shared/lib/utils';

export type CommentSortControlsProps = {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  isFetching?: boolean;
};

type SortableColumn = {
  field: SortField;
  label: string;
};

const SORTABLE_COLUMNS: SortableColumn[] = [
  { field: 'userName', label: 'User Name' },
  { field: 'email', label: 'E-mail' },
  { field: 'createdAt', label: 'Date Created' },
];

const SortIcon = ({
  field,
  sortBy,
  sortOrder,
}: {
  field: SortField;
  sortBy: SortField;
  sortOrder: SortOrder;
}) => {
  if (field !== sortBy) {
    return (
      <ArrowUp className="h-3.5 w-3.5 text-muted-foreground/40" aria-hidden />
    );
  }

  return sortOrder === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5" aria-hidden />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" aria-hidden />
  );
};

export const CommentSortControls = ({
  sortBy,
  sortOrder,
  onSortChange,
  isFetching = false,
}: CommentSortControlsProps) => (
  <div
    className={cn(
      'flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3',
      isFetching && 'pointer-events-none opacity-60',
    )}
    role="toolbar"
    aria-label="Sort comments"
  >
    <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
    {SORTABLE_COLUMNS.map(({ field, label }) => (
      <button
        key={field}
        type="button"
        aria-pressed={field === sortBy}
        onClick={() => onSortChange(field)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          field === sortBy
            ? 'border-border bg-background text-foreground'
            : 'text-muted-foreground',
        )}
      >
        {label}
        {field === sortBy ? (
          <span className="sr-only">
            {`, sorted ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          </span>
        ) : null}
        <SortIcon field={field} sortBy={sortBy} sortOrder={sortOrder} />
      </button>
    ))}
  </div>
);
