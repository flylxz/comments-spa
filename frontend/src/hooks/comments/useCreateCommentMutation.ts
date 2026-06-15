import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createComment } from '@/features/comments/api/commentApi';
import { commentQueryKeys } from '@/features/comments/api/commentQueryKeys';

/** Submits a new comment and invalidates cached comment lists on success. */
export const useCreateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentQueryKeys.all });
    },
  });
};
