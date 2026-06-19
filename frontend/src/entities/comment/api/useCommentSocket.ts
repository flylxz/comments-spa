import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';

import { commentQueryKeys } from '@/entities/comment/api/queryKeys';
import type { Comment } from '@/entities/comment/model/types';
import { env } from '@/shared/config/env';

const COMMENTS_NEW_EVENT = 'comments:new' as const;

const resolveSocketUrl = (): string | undefined =>
  env.apiOrigin.length > 0 ? env.apiOrigin : undefined;

/** Subscribes to real-time comment events and refreshes cached lists. */
export const useCommentSocket = (): void => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket: Socket = io(resolveSocketUrl(), {
      path: '/socket.io',
    });

    const handleNewComment = (_comment: Comment): void => {
      queryClient.invalidateQueries({ queryKey: commentQueryKeys.all });
    };

    socket.on(COMMENTS_NEW_EVENT, handleNewComment);

    return () => {
      socket.off(COMMENTS_NEW_EVENT, handleNewComment);
      socket.disconnect();
    };
  }, [queryClient]);
};
