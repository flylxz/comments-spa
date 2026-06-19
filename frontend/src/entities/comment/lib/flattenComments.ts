import type { Comment } from '@/entities/comment/model/types';

/** Flattens a nested comment tree into a plain list. */
export const flattenComments = (comments: Comment[]): Comment[] => {
  const result: Comment[] = [];

  for (const { replies, ...comment } of comments) {
    result.push(comment);

    if (replies && replies.length > 0) {
      result.push(...flattenComments(replies));
    }
  }

  return result;
};
