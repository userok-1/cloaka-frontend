import { apiRequest } from '../../shared/api/client';
import {
  FilterLogSchema,
  GetLogsQuery,
  PaginatedResponseSchema,
} from '../../shared/lib/zod-schemas';

const FilterLogsResponseSchema = PaginatedResponseSchema(FilterLogSchema);

export const logsApi = {
  getFilterLogs: async (params: {
    limit?: number;
    page?: number;
    sort?: 'asc' | 'desc';
    streamIds?: string;
  }) => {
    const query = GetLogsQuery.parse({
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: params.sort ?? 'desc',
      streamIds: params.streamIds,
    });
    const response = await apiRequest<unknown>('/logger/filter-logs', {
      params: {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        ...(query.streamIds ? { streamIds: query.streamIds } : {}),
      },
    });
    return FilterLogsResponseSchema.parse(response);
  },
};
