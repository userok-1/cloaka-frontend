import { z } from 'zod';
import { apiRequest } from '../../shared/api/client';

const DashboardStatsSchema = z.object({
  total: z.number().nonnegative().default(0),
  allowed: z.number().nonnegative().default(0),
  blocked: z.number().nonnegative().default(0),
  passRate: z.number().min(0).max(100).optional(),
  passRateText: z.string().optional(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const dashboardApi = {
  getDashboardStats: async (params?: {
    streamId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<DashboardStats> => {
    const response = await apiRequest<Record<string, unknown> | undefined>(
      '/statistics/dashboard',
      {
        params: {
          ...(params?.streamId != null && params.streamId >= 1
            ? { streamId: params.streamId }
            : {}),
          ...(params?.dateFrom ? { dateFrom: params.dateFrom } : {}),
          ...(params?.dateTo ? { dateTo: params.dateTo } : {}),
        },
      }
    );

    const toNumberOrUndefined = (v: unknown): number | undefined => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
      if (typeof v === 'string') {
        const s = v.trim();
        if (!s) return undefined;
        const n = Number(s);
        return Number.isFinite(n) ? n : undefined;
      }
      return undefined;
    };

    const toTrimmedStringOrUndefined = (v: unknown): string | undefined => {
      if (v === null || v === undefined) return undefined;
      if (typeof v === 'string') {
        const s = v.trim();
        return s ? s : undefined;
      }
      if (typeof v === 'number') return Number.isFinite(v) ? String(v) : undefined;
      return undefined;
    };

    const raw = (response ?? {}) as Record<string, unknown>;
    const totalRaw =
      raw.total ??
      raw.totalVisits ??
      raw.total_visits ??
      raw.visits ??
      0;
    const allowedRaw =
      raw.allowed ??
      raw.allowedVisits ??
      raw.passed ??
      raw.allow ??
      0;
    const blockedRaw =
      raw.blocked ??
      raw.blockedVisits ??
      raw.denied ??
      raw.reject ??
      0;
    const passRateRaw =
      raw.passRate ??
      raw.pass_rate ??
      raw.percentageOfAllowedVisits ??
      raw.percentage_of_allowed_visits;

    const total = toNumberOrUndefined(totalRaw) ?? 0;
    const allowed = toNumberOrUndefined(allowedRaw) ?? 0;
    const blocked = toNumberOrUndefined(blockedRaw) ?? 0;
    const passRate = toNumberOrUndefined(passRateRaw);
    const passRateText = (() => {
      const s = toTrimmedStringOrUndefined(passRateRaw);
      if (!s) return undefined;
      const n = Number(s);
      return Number.isFinite(n) ? s : undefined;
    })();

    const normalized = {
      total: Number.isFinite(total) && total >= 0 ? total : 0,
      allowed: Number.isFinite(allowed) && allowed >= 0 ? allowed : 0,
      blocked: Number.isFinite(blocked) && blocked >= 0 ? blocked : 0,
      ...(Number.isFinite(passRate) ? { passRate } : {}),
      ...(passRateText ? { passRateText } : {}),
    };

    return DashboardStatsSchema.parse(normalized);
  },
};

