import { FileText, ZoomIn } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  fetchCommentAttachmentSize,
  getCachedCommentAttachmentSize,
} from '@/entities/comment/lib/fetchCommentAttachmentSize';
import {
  formatCommentAttachmentSize,
  getCommentAttachmentFileName,
  getCommentAttachmentFormat,
} from '@/entities/comment/lib/parseCommentAttachmentMeta';
import {
  isCommentImageAttachment,
  resolveCommentFileUrl,
} from '@/entities/comment/lib/resolveCommentFileUrl';
import { interactiveFileChip } from '@/shared/lib/interactiveStyles';
import { cn } from '@/shared/lib/utils';

export type CommentAttachmentProps = {
  commentId: number;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  className?: string;
};

export const CommentAttachment = ({
  commentId,
  fileUrl,
  fileName: storedFileName,
  fileSize: storedFileSize,
  className,
}: CommentAttachmentProps) => {
  const resolvedUrl = resolveCommentFileUrl(fileUrl);
  const displayFileName =
    storedFileName ?? getCommentAttachmentFileName(fileUrl);
  const fileFormat = getCommentAttachmentFormat(displayFileName);
  const [fileSize, setFileSize] = useState<number | null>(() => {
    if (storedFileSize != null) {
      return storedFileSize;
    }

    const cached = getCachedCommentAttachmentSize(resolvedUrl);

    return cached === undefined ? null : cached;
  });

  useEffect(() => {
    if (isCommentImageAttachment(fileUrl)) {
      return;
    }

    if (storedFileSize != null) {
      setFileSize(storedFileSize);
      return;
    }

    const cached = getCachedCommentAttachmentSize(resolvedUrl);

    if (cached !== undefined) {
      setFileSize(cached);
      return;
    }

    let cancelled = false;

    const loadFileSize = async (): Promise<void> => {
      const bytes = await fetchCommentAttachmentSize(resolvedUrl);

      if (!cancelled) {
        setFileSize(bytes);
      }
    };

    void loadFileSize();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, resolvedUrl, storedFileSize]);

  if (isCommentImageAttachment(fileUrl)) {
    return (
      <div className={cn('mt-4', className)}>
        <a
          href={resolvedUrl}
          data-lightbox={`comment-${commentId}`}
          data-alt={`Attachment for comment ${commentId}`}
          className="group relative inline-block h-40 w-56 cursor-zoom-in overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
          aria-label="View attached image"
        >
          <img
            src={resolvedUrl}
            alt={`Attachment for comment ${commentId}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
          >
            <ZoomIn className="h-7 w-7 text-white opacity-0 drop-shadow-md transition-opacity duration-300 group-hover:opacity-100" />
          </span>
        </a>
      </div>
    );
  }

  const metaParts = [
    fileFormat,
    fileSize !== null ? formatCommentAttachmentSize(fileSize) : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className={cn('mt-4', className)}>
      <a
        href={resolvedUrl}
        download={displayFileName}
        className={cn(
          interactiveFileChip,
          'inline-flex max-w-full items-center gap-3 px-3 py-2 text-sm text-primary',
        )}
      >
        <FileText className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 text-left">
          Download attachment:
          <span className="block truncate font-medium text-foreground">
            {displayFileName}
          </span>
          {metaParts.length > 0 && (
            <span className="block text-xs text-muted-foreground">
              {metaParts.join(' · ')}
            </span>
          )}
        </span>
      </a>
    </div>
  );
};
