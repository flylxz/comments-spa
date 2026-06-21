import { lazy, type ReactNode, Suspense } from 'react';

import type { Comment } from '@/entities/comment/model/types';
import type { CommentFormProps } from '@/features/manage-comments/ui/CommentForm';

const LazyCommentForm = lazy(() =>
  import('@/features/manage-comments/ui/CommentForm').then((module) => ({
    default: module.CommentForm,
  })),
);

const ReplyFormFallback = () => (
  <div
    aria-hidden
    className="h-32 animate-pulse rounded-lg border border-border bg-muted"
  />
);

export type ReplyCommentFormProps = CommentFormProps;

export const ReplyCommentForm = ({
  parentId,
  onSuccess,
}: ReplyCommentFormProps) => (
  <Suspense fallback={<ReplyFormFallback />}>
    <LazyCommentForm parentId={parentId} onSuccess={onSuccess} />
  </Suspense>
);

export type ReplyCommentFormRenderer = (
  commentId: number,
  onSuccess: (comment: Comment) => void,
) => ReactNode;
