import type { Comment } from '@/entities/comment/model/types';
import { cn } from '@/shared/lib/utils';

import { CommentCard } from './CommentCard';

export type CommentTreeProps = {
  comments: Comment[];
  onReplyClick?: (commentId: number) => void;
  depth?: number;
};

export const CommentTree = ({
  comments,
  onReplyClick,
  depth = 0,
}: CommentTreeProps) => (
  <div className="flex flex-col gap-4">
    {comments.map((comment) => (
      <div key={comment.id} className="flex flex-col gap-4">
        <CommentCard comment={comment} onReplyClick={onReplyClick} />

        {comment.replies && comment.replies.length > 0 ? (
          <div
            className={cn(
              'border-l border-border',
              depth > 5 ? 'pl-0' : 'pl-6',
            )}
          >
            <CommentTree
              comments={comment.replies}
              onReplyClick={onReplyClick}
              depth={depth + 1}
            />
          </div>
        ) : null}
      </div>
    ))}
  </div>
);
