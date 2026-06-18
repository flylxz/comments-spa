import type { HTMLAttributes, ImgHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/utils';

export const Avatar = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
);

export const AvatarImage = ({
  className,
  alt = '',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    alt={alt}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
);

export const AvatarFallback = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground',
      className,
    )}
    {...props}
  />
);
