import {
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  startTransition,
  useCallback,
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
import { findTopLevelCommentId } from '@/entities/comment/lib/findTopLevelCommentId';
import {
  SCROLL_LAYOUT_SETTLE_MS,
  scrollToComment,
  scrollToReplyFormIfObscured,
} from '@/entities/comment/lib/scrollToComment';
import { ReplyCommentForm } from '@/features/manage-comments/ui/ReplyCommentForm';
import { cn } from '@/shared/lib/utils';

const HIGHLIGHT_DURATION_MS = 2400;

export type CommentsListRegionProps = {
  queryParams: GetCommentsParams;
  setQueryParams: Dispatch<SetStateAction<GetCommentsParams>>;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  highlightedCommentId: number | null;
  onHighlightComplete: () => void;
  collapsedThreadIds: ReadonlySet<number>;
  onToggleThreadCollapsed: (topLevelCommentId: number) => void;
  onCommentCreated: (comment: Comment) => void;
  skipNextPageScrollRef: RefObject<boolean>;
  onEnsureThreadExpanded: (topLevelCommentId: number) => void;
};

export const CommentsListRegion = ({
  queryParams,
  setQueryParams,
  replyingToCommentId,
  onReplyClick,
  highlightedCommentId,
  onHighlightComplete,
  collapsedThreadIds,
  onToggleThreadCollapsed,
  onCommentCreated,
  skipNextPageScrollRef,
  onEnsureThreadExpanded,
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

  const comments = useMemo(
    () => (data ? normalizeCommentTree(data.data) : []),
    [data],
  );

  const isInitialLoading = isLoading && !data;

  const handleReplyClickWithScroll = useCallback(
    (commentId: number): void => {
      startTransition(() => {
        const isClosing = replyingToCommentId === commentId;

        if (!isClosing) {
          const rootId = findTopLevelCommentId(comments, commentId);

          if (rootId !== null) {
            onEnsureThreadExpanded(rootId);
          }
        }

        onReplyClick(commentId);
      });
    },
    [replyingToCommentId, comments, onEnsureThreadExpanded, onReplyClick],
  );

  useEffect(() => {
    if (previousPageRef.current === queryParams.page) {
      return;
    }

    previousPageRef.current = queryParams.page;

    if (skipNextPageScrollRef.current) {
      skipNextPageScrollRef.current = false;
      return;
    }

    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [queryParams.page, skipNextPageScrollRef]);

  useEffect(() => {
    if (highlightedCommentId === null) {
      return;
    }

    const commentId = highlightedCommentId;
    let highlightTimer: ReturnType<typeof setTimeout> | undefined;

    const scrollTimer = setTimeout(() => {
      scrollToComment(commentId);
      highlightTimer = setTimeout(onHighlightComplete, HIGHLIGHT_DURATION_MS);
    }, SCROLL_LAYOUT_SETTLE_MS);

    return () => {
      clearTimeout(scrollTimer);
      if (highlightTimer !== undefined) {
        clearTimeout(highlightTimer);
      }
    };
  }, [highlightedCommentId, onHighlightComplete]);

  useEffect(() => {
    if (replyingToCommentId === null) {
      return;
    }

    const commentId = replyingToCommentId;

    const scrollTimer = setTimeout(() => {
      scrollToReplyFormIfObscured(commentId);
    }, SCROLL_LAYOUT_SETTLE_MS);

    return () => {
      clearTimeout(scrollTimer);
    };
  }, [replyingToCommentId]);

  const listRegionContent = (
    <>
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
            comments={comments}
            queryParams={queryParams}
            onSortChange={handleSortChange}
            isFetching={isFetching}
            replyingToCommentId={replyingToCommentId}
            onReplyClick={handleReplyClickWithScroll}
            highlightedCommentId={highlightedCommentId}
            collapsedThreadIds={collapsedThreadIds}
            onToggleThreadCollapsed={onToggleThreadCollapsed}
            onCommentCreated={onCommentCreated}
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
    </>
  );

  return (
    <div
      ref={listRef}
      id="comments-list-region"
      className="flex flex-col gap-4 scroll-mt-6"
    >
      {listRegionContent}
    </div>
  );
};

type CommentsListContentProps = {
  comments: Comment[];
  queryParams: GetCommentsParams;
  onSortChange: (field: SortField) => void;
  isFetching: boolean;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  highlightedCommentId: number | null;
  collapsedThreadIds: ReadonlySet<number>;
  onToggleThreadCollapsed: (topLevelCommentId: number) => void;
  onCommentCreated: (comment: Comment) => void;
};

const createReplyFormRenderer = (
  onCommentCreated: (comment: Comment) => void,
): ((commentId: number) => ReactNode) => {
  return (commentId: number): ReactNode => (
    <ReplyCommentForm parentId={commentId} onSuccess={onCommentCreated} />
  );
};

const CommentsListContent = ({
  comments,
  queryParams,
  onSortChange,
  isFetching,
  replyingToCommentId,
  onReplyClick,
  highlightedCommentId,
  collapsedThreadIds,
  onToggleThreadCollapsed,
  onCommentCreated,
}: CommentsListContentProps) => {
  const renderReplyForm = useMemo(
    () => createReplyFormRenderer(onCommentCreated),
    [onCommentCreated],
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
        highlightedCommentId={highlightedCommentId}
        collapsedThreadIds={collapsedThreadIds}
        onToggleThreadCollapsed={onToggleThreadCollapsed}
      />
    </div>
  );
};
