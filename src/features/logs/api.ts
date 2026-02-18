import { apiRequest } from '../../shared/api/client';
import {
  FilterLogSchema,
  ErrorLogSchema,
  GetLogsQuery,
  PaginatedResponseSchema,
} from '../../shared/lib/zod-schemas';

const FilterLogsResponseSchema = PaginatedResponseSchema(FilterLogSchema);
const ErrorLogsResponseSchema = PaginatedResponseSchema(ErrorLogSchema);

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
    const response = await apiRequest<{
      data?: Array<Record<string, unknown>>;
      total?: number;
    }>('/logger/filter-logs', {
      params: {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        ...(query.streamIds ? { streamIds: query.streamIds } : {}),
      },
    });

    const rawData = response?.data ?? [];
    const normalized = {
      data: rawData.map((item) => ({
        id: item.id,
        streamId: Number(item.stream_id ?? item.streamId ?? 0),
        passed: Boolean(item.passed),
        reason: item.reason ?? null,
        metadata: item.metadata ?? null,
        createdAt: String(item.timestamp ?? item.createdAt ?? ''),
      })),
      total: response?.total,
    };
    return FilterLogsResponseSchema.parse(normalized);
  },

  getErrors: async (params: {
    limit?: number;
    page?: number;
    sort?: 'asc' | 'desc';
  }) => {
    const query = GetLogsQuery.parse({
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: params.sort ?? 'desc',
    });
    const response = await apiRequest<unknown>('/logger/errors', {
      params: {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      },
    });
    return ErrorLogsResponseSchema.parse(response);
  },
};
