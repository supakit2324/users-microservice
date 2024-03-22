import { FilterQuery, SortOrder } from 'mongoose';

export interface FindOptionsInterface<T> {
  filter: FilterQuery<T>;
  select: Record<string, number>;
  sort: Record<string, SortOrder>;
  limit?: number;
}
