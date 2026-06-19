import { format } from 'date-fns';

/** Formats an ISO date string for display in comment UI. */
export const formatCommentDate = (createdAt: string): string => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return format(date, 'dd MMM yyyy, HH:mm');
};
