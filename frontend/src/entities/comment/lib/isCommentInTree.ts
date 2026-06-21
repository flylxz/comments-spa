import type { Comment } from '@/entities/comment/model/types';

export const isCommentInTree = (root: Comment, targetId: number): boolean => {
  if (root.id === targetId) {
    return true;
  }

  return (
    root.replies?.some((reply) => isCommentInTree(reply, targetId)) ?? false
  );
};
