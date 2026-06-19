import { motion, type Variants } from 'motion/react';
import { useState } from 'react';

import type { GetCommentsParams } from '@/entities/comment';
import {
  CommentTree,
  normalizeCommentTree,
  useCommentsQuery,
} from '@/entities/comment';
import { CommentForm } from '@/features/manage-comments';

const DEFAULT_QUERY_PARAMS = {
  page: 1,
  sortBy: 'createdAt',
  sortOrder: 'desc',
} satisfies GetCommentsParams;

const sectionVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

export const CommentSection = () => {
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null,
  );
  const { data, isLoading, isError, error } =
    useCommentsQuery(DEFAULT_QUERY_PARAMS);

  const handleReplyClick = (commentId: number): void => {
    setReplyingToCommentId((current) =>
      current === commentId ? null : commentId,
    );
  };

  const handleReplyClose = (): void => {
    setReplyingToCommentId(null);
  };

  if (isLoading) {
    return (
      <motion.section
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted">
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        </div>
      </motion.section>
    );
  }

  if (isError) {
    return (
      <motion.section
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
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
      </motion.section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <motion.section
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-8"
    >
      <CommentForm parentId={null} />
      <CommentTree
        comments={normalizeCommentTree(data.data)}
        replyingToCommentId={replyingToCommentId}
        onReplyClick={handleReplyClick}
        renderReplyForm={(commentId) => (
          <CommentForm parentId={commentId} onSuccess={handleReplyClose} />
        )}
      />
    </motion.section>
  );
};
