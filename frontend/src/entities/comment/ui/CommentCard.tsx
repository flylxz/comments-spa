import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  CornerUpLeft,
  Hash,
} from 'lucide-react';
import { memo } from 'react';

import { formatCommentDate } from '@/entities/comment/lib/formatCommentDate';
import { sanitizeCommentHtml } from '@/entities/comment/lib/sanitizeCommentHtml';
import type { Comment } from '@/entities/comment/model/types';
import { CommentAttachment } from '@/entities/comment/ui/CommentAttachment';
import { interactiveIconButton } from '@/shared/lib/interactiveStyles';
import { cn } from '@/shared/lib/utils';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';

export type CommentCardProps = {
  comment: Comment;
  onReplyClick?: (commentId: number) => void;
};

const getInitials = (userName: string): string => {
  const parts = userName.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    const [first, second] = parts;
    return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase();
  }

  return userName.slice(0, 2).toUpperCase();
};

const CommentCardComponent = ({ comment, onReplyClick }: CommentCardProps) => {
  const safeHtml = comment.sanitizedText ?? sanitizeCommentHtml(comment.text);

  const handleReplyClick = (): void => {
    onReplyClick?.(comment.id);
  };

  return (
    <article
      id={`comment-${comment.id}`}
      className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
    >
      <header
        className={cn(
          'flex items-start justify-between gap-4 rounded-md bg-accent p-2',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {comment.userName}
            </p>
            <time
              className="text-sm text-muted-foreground"
              dateTime={comment.createdAt}
            >
              {formatCommentDate(comment.createdAt)}
            </time>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <a
            href={`#comment-${comment.id}`}
            className={interactiveIconButton}
            aria-label="Permalink"
          >
            <Hash className="h-4 w-4" />
          </a>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            aria-label="Bookmark"
          >
            <Bookmark className="h-4 w-4" />
          </Button>

          <div className="ml-1 flex items-center rounded-md border border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none text-muted-foreground"
              aria-label="Upvote"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>

            <span className="min-w-6 px-1 text-center text-sm font-medium text-foreground">
              0
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none text-muted-foreground"
              aria-label="Downvote"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div
        className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_p+p]:mt-2"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized with DOMPurify before rendering
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {comment.fileUrl ? (
        <CommentAttachment
          commentId={comment.id}
          fileUrl={comment.fileUrl}
          fileName={comment.fileName}
          fileSize={comment.fileSize}
        />
      ) : null}

      <footer className="mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-1.5 px-1 -ml-1 text-muted-foreground"
          onClick={handleReplyClick}
        >
          <CornerUpLeft className="h-4 w-4" />
          Reply
        </Button>
      </footer>
    </article>
  );
};

export const CommentCard = memo(CommentCardComponent);
