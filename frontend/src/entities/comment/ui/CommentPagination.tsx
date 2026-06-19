import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ChangeEvent, useId } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';

export type CommentPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isFetching?: boolean;
};

export const CommentPagination = ({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  isFetching = false,
}: CommentPaginationProps) => {
  const pageSelectId = useId();

  if (total === 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;
  const pageOptions = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  const handlePageSelect = (event: ChangeEvent<HTMLSelectElement>): void => {
    onPageChange(Number(event.target.value));
  };

  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3',
        isFetching && 'pointer-events-none opacity-60',
      )}
      aria-label="Comments pagination"
    >
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total} threads
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={isFirstPage}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <label
            htmlFor={pageSelectId}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            Page
            <Select id={pageSelectId} value={page} onChange={handlePageSelect}>
              {pageOptions.map((pageNumber) => (
                <option key={pageNumber} value={pageNumber}>
                  {pageNumber}
                </option>
              ))}
            </Select>
            of {totalPages}
          </label>

          <Button
            variant="ghost"
            size="sm"
            disabled={isLastPage}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </nav>
  );
};
