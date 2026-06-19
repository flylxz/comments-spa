import { motion, type Variants } from 'motion/react';
import { useState } from 'react';

import type { GetCommentsParams } from '@/entities/comment';
import { CommentForm } from '@/features/manage-comments';

import { CommentsListRegion } from './CommentsListRegion';

const sectionVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

export const CommentSection = () => {
  const [queryParams, setQueryParams] = useState<GetCommentsParams>({
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null,
  );

  const handleReplyClick = (commentId: number): void => {
    setReplyingToCommentId((current) =>
      current === commentId ? null : commentId,
    );
  };

  const handleReplyClose = (): void => {
    setReplyingToCommentId(null);
  };

  return (
    <motion.section
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-8"
    >
      <CommentForm parentId={null} />
      <CommentsListRegion
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        replyingToCommentId={replyingToCommentId}
        onReplyClick={handleReplyClick}
        onReplyClose={handleReplyClose}
      />
    </motion.section>
  );
};
