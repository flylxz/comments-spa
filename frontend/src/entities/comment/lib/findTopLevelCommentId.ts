import { isCommentInTree } from '@/entities/comment/lib/isCommentInTree';
import type { Comment } from '@/entities/comment/model/types';

export const findTopLevelCommentId = (
  comments: Comment[],
  targetId: number,
): number | null => {
  for (const comment of comments) {
    if (comment.id === targetId || isCommentInTree(comment, targetId)) {
      return comment.id;
    }
  }

  return null;
};
