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
    const response = await apiRequest<{
      data?: Array<Record<string, unknown>>;
      errors?: Array<Record<string, unknown>>;
      results?: Array<Record<string, unknown>>;
      items?: Array<Record<string, unknown>>;
      total?: number;
    }>('/logger/errors', {
      params: {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      },
    });

    const dataMaybe = response?.data;
    const rawData: Array<Record<string, unknown>> = Array.isArray(dataMaybe)
      ? dataMaybe
      : dataMaybe && typeof dataMaybe === 'object' && Array.isArray((dataMaybe as Record<string, unknown>).data)
        ? ((dataMaybe as Record<string, unknown>).data as Array<Record<string, unknown>>)
        : dataMaybe && typeof dataMaybe === 'object' && Array.isArray((dataMaybe as Record<string, unknown>).items)
          ? ((dataMaybe as Record<string, unknown>).items as Array<Record<string, unknown>>)
          : response?.errors ??
            response?.results ??
            response?.items ??
            (Array.isArray(response) ? response : []);

    const normalized = {
      data: rawData.map((item) => ({
        id: item.id != null ? item.id : '',
        statusCode: (() => {
          const a = item.status_code ?? item.statusCode;
          if (a === undefined || a === null) return undefined;
          const n = Number(a);
          return Number.isNaN(n) ? undefined : n;
        })(),
        module: item.module != null ? String(item.module) : undefined,
        controller: item.controller != null ? String(item.controller) : undefined,
        handler: item.handler != null ? String(item.handler) : undefined,
        message: String(
          item.message ?? item.error_message ?? item.err ?? item.error ?? ''
        ),
        stackTrace:
          item.stack_trace != null
            ? String(item.stack_trace)
            : item.stackTrace != null
              ? String(item.stackTrace)
              : undefined,
        metadata: item.metadata ?? undefined,
        createdAt: String(
          item.timestamp ?? item.createdAt ?? item.created_at ?? ''
        ),
      })),
      total: response?.total,
    };
    return ErrorLogsResponseSchema.parse(normalized);
  },
};
