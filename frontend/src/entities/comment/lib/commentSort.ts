import type {
  GetCommentsParams,
  SortField,
} from '@/entities/comment/model/types';

/** Returns the next query params after a sortable column header click. */
export const getNextSortParams = (
  current: GetCommentsParams,
  field: SortField,
): GetCommentsParams => ({
  page: 1,
  sortBy: field,
  sortOrder:
    current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc',
});
