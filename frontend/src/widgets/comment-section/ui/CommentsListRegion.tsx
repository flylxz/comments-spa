import type { ReactNode } from 'react';

import type { Comment, GetCommentsParams, SortField } from '@/entities/comment';
import {
  CommentSortControls,
  CommentTree,
  normalizeCommentTree,
  useCommentsQuery,
} from '@/entities/comment';
import { CommentForm } from '@/features/manage-comments';
import { cn } from '@/shared/lib/utils';

export type CommentsListRegionProps = {
  queryParams: GetCommentsParams;
  onSortChange: (field: SortField) => void;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  onReplyClose: () => void;
};

export const CommentsListRegion = ({
  queryParams,
  onSortChange,
  replyingToCommentId,
  onReplyClick,
  onReplyClose,
}: CommentsListRegionProps) => {
  const { data, isLoading, isFetching, isError, error } =
    useCommentsQuery(queryParams);

  const isInitialLoading = isLoading && !data;

  return (
    <div className="flex flex-col gap-4">
      <CommentSortControls
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        onSortChange={onSortChange}
        isFetching={isFetching}
      />

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
        <CommentsListContent
          data={data.data}
          isFetching={isFetching}
          replyingToCommentId={replyingToCommentId}
          onReplyClick={onReplyClick}
          onReplyClose={onReplyClose}
        />
      ) : null}
    </div>
  );
};

type CommentsListContentProps = {
  data: Comment[];
  isFetching: boolean;
  replyingToCommentId: number | null;
  onReplyClick: (commentId: number) => void;
  onReplyClose: () => void;
};

const CommentsListContent = ({
  data,
  isFetching,
  replyingToCommentId,
  onReplyClick,
  onReplyClose,
}: CommentsListContentProps) => {
  const comments = normalizeCommentTree(data);

  const renderReplyForm = (commentId: number): ReactNode => (
    <CommentForm parentId={commentId} onSuccess={onReplyClose} />
  );

  return (
    <div className={cn(isFetching && 'pointer-events-none opacity-60')}>
      {comments.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        </div>
      ) : (
        <CommentTree
          comments={comments}
          replyingToCommentId={replyingToCommentId}
          onReplyClick={onReplyClick}
          renderReplyForm={renderReplyForm}
        />
      )}
    </div>
  );
};
