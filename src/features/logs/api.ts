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
    streamId?: string;
    /** @deprecated use streamId */
    streamIds?: string;
    search?: string;
    reason?: number;
    passed?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const query = GetLogsQuery.parse({
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      sort: params.sort ?? 'desc',
      streamId: params.streamId ?? params.streamIds,
      search: params.search,
      reason: params.reason,
      passed: params.passed,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    });
    const response = await apiRequest<{
      data?: Array<Record<string, unknown>>;
      totalFiltered?: number;
    }>('/logger/filter-logs', {
      params: {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        ...(query.streamId ? { streamId: query.streamId } : {}),
        ...(query.search?.trim() ? { search: query.search.trim() } : {}),
        ...(query.reason != null ? { reason: query.reason } : {}),
        ...(query.passed !== undefined ? { passed: query.passed } : {}),
        ...(query.dateFrom ? { dateFrom: query.dateFrom } : {}),
        ...(query.dateTo ? { dateTo: query.dateTo } : {}),
      },
    });

    const rawData = response?.data ?? [];
    const normalized = {
      data: rawData.map((item) => ({
        id: item.id,
        streamId: Number(item.stream_id ?? item.streamId ?? 0),
        streamName: item.stream_name != null ? String(item.stream_name) : null,
        passed: Boolean(item.passed),
        reason: item.reason ?? null,
        metadata: item.metadata ?? null,
        createdAt: String(item.timestamp ?? item.createdAt ?? ''),
      })),
      total: response?.totalFiltered,
    };
    return FilterLogsResponseSchema.parse(normalized);
  },

  getErrors: async (params: {
    limit?: number;
    page?: number;
    sort?: 'asc' | 'desc';
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const sort = params.sort ?? 'desc';
    const response = await apiRequest<{
      data?: Array<Record<string, unknown>>;
      errors?: Array<Record<string, unknown>>;
      results?: Array<Record<string, unknown>>;
      items?: Array<Record<string, unknown>>;
      total?: number;
      totalFiltered?: number;
    }>('/logger/errors', {
      params: {
        page,
        limit,
        sort,
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
        ...(params.dateTo ? { dateTo: params.dateTo } : {}),
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
      total: response?.totalFiltered ?? response?.total,
    };
    return ErrorLogsResponseSchema.parse(normalized);
  },
};
