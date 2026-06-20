import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

type CommentThreadBranchProps = {
  isLast: boolean;
  children: ReactNode;
};

/** Vertical and elbow connector lines for nested comment threads. */
export const CommentThreadBranch = ({
  isLast,
  children,
}: CommentThreadBranchProps) => (
  <div className="flex min-w-0 gap-3">
    <div className="relative w-6 shrink-0 self-stretch" aria-hidden>
      <div
        className={cn(
          'absolute left-1/2 top-0 w-px -translate-x-1/2 bg-border',
          isLast ? 'h-5' : 'h-full',
        )}
      />
      <div className="absolute left-1/2 top-5 h-px w-6 bg-border" />
    </div>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);
