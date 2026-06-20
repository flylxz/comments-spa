import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import type { Comment, GetCommentsParams, SortField } from '@/entities/comment';
import {
  CommentPagination,
  CommentsSortBar,
  CommentTree,
  getNextSortParams,
  normalizeCommentTree,
  useCommentsQuery,
} from '@/entities/comment';
import { CommentForm } from '@/features/manage-comments';
import { cn } from '@/shared/lib/utils';

export type CommentsListRegionProps = {
  queryParams: GetCommentsParams;
  setQueryParams: Dispatch<SetStateAction<GetCommentsParams>>;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  onReplyClose: () => void;
};

export const CommentsListRegion = ({
  queryParams,
  setQueryParams,
  replyingToCommentId,
  onReplyClick,
  onReplyClose,
}: CommentsListRegionProps) => {
  const handleSortChange = (field: SortField): void => {
    setQueryParams((current) => getNextSortParams(current, field));
  };

  const handlePageChange = (page: number): void => {
    setQueryParams((current) => ({ ...current, page }));
  };

  const listRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(queryParams.page);
  const { data, isLoading, isFetching, isError, error } =
    useCommentsQuery(queryParams);

  const isInitialLoading = isLoading && !data;

  useEffect(() => {
    if (previousPageRef.current === queryParams.page) {
      return;
    }

    previousPageRef.current = queryParams.page;
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [queryParams.page]);

  return (
    <div
      ref={listRef}
      id="comments-list-region"
      className="flex flex-col gap-4 scroll-mt-6"
    >
      {isInitialLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        </div>
      ) : null}

      {!isInitialLoading && isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Failed to load comments
          </p>
          {error instanceof Error ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-500">
              {error.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {!isInitialLoading && !isError && data ? (
        <>
          <CommentPagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            pageSize={data.pagination.pageSize}
            onPageChange={handlePageChange}
            isFetching={isFetching}
          />

          <CommentsListContent
            data={data.data}
            queryParams={queryParams}
            onSortChange={handleSortChange}
            isFetching={isFetching}
            replyingToCommentId={replyingToCommentId}
            onReplyClick={onReplyClick}
            onReplyClose={onReplyClose}
          />

          {data.pagination.totalPages > 1 ? (
            <CommentPagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              pageSize={data.pagination.pageSize}
              onPageChange={handlePageChange}
              isFetching={isFetching}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
};

type CommentsListContentProps = {
  data: Comment[];
  queryParams: GetCommentsParams;
  onSortChange: (field: SortField) => void;
  isFetching: boolean;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  onReplyClose: () => void;
};

const createReplyFormRenderer = (
  onReplyClose: () => void,
): ((commentId: number) => ReactNode) => {
  return (commentId: number): ReactNode => (
    <CommentForm parentId={commentId} onSuccess={onReplyClose} />
  );
};

const CommentsListContent = ({
  data,
  queryParams,
  onSortChange,
  isFetching,
  replyingToCommentId,
  onReplyClick,
  onReplyClose,
}: CommentsListContentProps) => {
  const comments = useMemo(() => normalizeCommentTree(data), [data]);

  const renderReplyForm = useMemo(
    () => createReplyFormRenderer(onReplyClose),
    [onReplyClose],
  );

  if (comments.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        isFetching && 'pointer-events-none opacity-60',
      )}
    >
      <CommentsSortBar
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        onSortChange={onSortChange}
      />
      <CommentTree
        comments={comments}
        replyingToCommentId={replyingToCommentId}
        onReplyClick={onReplyClick}
        renderReplyForm={renderReplyForm}
      />
    </div>
  );
};
