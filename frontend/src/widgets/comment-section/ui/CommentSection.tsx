import type { GetCommentsParams } from '@/entities/comment';
import {
  buildCommentTree,
  CommentTree,
  useCommentsQuery,
} from '@/entities/comment';
import { CommentForm } from '@/features/manage-comments';

const DEFAULT_QUERY_PARAMS = {
  page: 1,
  sortBy: 'createdAt',
  sortOrder: 'desc',
} satisfies GetCommentsParams;

export const CommentSection = () => {
  const { data, isLoading, isError, error } =
    useCommentsQuery(DEFAULT_QUERY_PARAMS);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex flex-col gap-6">
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
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const treeData = buildCommentTree(data.data);

  return (
    <section className="flex flex-col gap-8">
      <CommentForm parentId={null} />
      <CommentTree comments={treeData} />
    </section>
  );
};
