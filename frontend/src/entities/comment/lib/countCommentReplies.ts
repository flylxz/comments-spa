import type { Comment } from '@/entities/comment/model/types';

/** Counts all nested replies for a comment. */
export const countCommentReplies = (comment: Comment): number => {
  if (!comment.replies?.length) {
    return 0;
  }

  return comment.replies.reduce(
    (total, reply) => total + 1 + countCommentReplies(reply),
    0,
  );
};
