import { ArrowDown, ArrowUp } from 'lucide-react';

import type { SortField, SortOrder } from '@/entities/comment/model/types';
import {
  interactiveSortTrigger,
  interactiveSortTriggerActive,
} from '@/shared/lib/interactiveStyles';
import { cn } from '@/shared/lib/utils';

export type CommentsSortBarProps = {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
};

type SortableColumn = {
  field: SortField;
  label: string;
};

const SORTABLE_COLUMNS: SortableColumn[] = [
  { field: 'userName', label: 'User Name' },
  { field: 'email', label: 'E-mail' },
  { field: 'createdAt', label: 'Date' },
];

export const CommentsSortBar = ({
  sortBy,
  sortOrder,
  onSortChange,
}: CommentsSortBarProps) => {
  const isAscending = sortOrder === 'asc';

  const handleFieldClick = (field: SortField): void => {
    // Re-clicking the active field is reserved for the direction toggle,
    // so selecting a field here only switches the active column.
    if (field !== sortBy) {
      onSortChange(field);
    }
  };

  const handleDirectionToggle = (): void => {
    // getNextSortParams flips asc/desc when the same field is passed again.
    onSortChange(sortBy);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-2">
      <span className="px-2 text-sm font-medium text-foreground">Sort by</span>

      {SORTABLE_COLUMNS.map(({ field, label }) => (
        <button
          key={field}
          type="button"
          aria-pressed={field === sortBy}
          onClick={() => handleFieldClick(field)}
          className={cn(
            interactiveSortTrigger,
            field === sortBy && interactiveSortTriggerActive,
          )}
        >
          {label}
        </button>
      ))}

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <button
        type="button"
        onClick={handleDirectionToggle}
        aria-label={`Sort direction: ${isAscending ? 'ascending' : 'descending'}`}
        className={cn(interactiveSortTrigger, interactiveSortTriggerActive)}
      >
        {isAscending ? (
          <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
        )}
        {isAscending ? 'Ascending' : 'Descending'}
      </button>
    </div>
  );
};
