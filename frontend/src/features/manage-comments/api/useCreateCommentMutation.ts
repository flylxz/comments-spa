import { useMutation, useQueryClient } from '@tanstack/react-query';

import { commentQueryKeys } from '@/entities/comment/api/queryKeys';

import { createComment } from '@/features/manage-comments/api/createComment';

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
