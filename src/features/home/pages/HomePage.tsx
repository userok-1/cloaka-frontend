import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { Modal } from '../../../shared/ui/Modal';
import { logsApi } from '../../logs/api';
import { streamsApi } from '../../streams/api';
import { useAuthStore } from '../../auth/store';
import type { FilterLog } from '../../../shared/lib/zod-schemas';
import { dashboardApi } from '../api';

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [detailLog, setDetailLog] = useState<FilterLog | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersMounted, setFiltersMounted] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const streamId = searchParams.get('streamId') ?? '';
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo = searchParams.get('dateTo') ?? '';
  const filtersActive = Boolean(streamId || dateFrom || dateTo);

  const closeFilters = () => setFiltersOpen(false);

  useEffect(() => {
    if (!filtersMounted) return;

    const onMouseDown = (e: MouseEvent) => {
      if (!filtersRef.current) return;
      if (!filtersRef.current.contains(e.target as Node)) closeFilters();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFilters();
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filtersMounted]);

  useEffect(() => {
    if (filtersOpen) {
      setFiltersMounted(true);
      const id = requestAnimationFrame(() => setFiltersVisible(true));
      return () => cancelAnimationFrame(id);
    }

    setFiltersVisible(false);
    if (!filtersMounted) return;
    const timeout = window.setTimeout(() => setFiltersMounted(false), 160);
    return () => window.clearTimeout(timeout);
  }, [filtersOpen, filtersMounted]);

  const updateParam = (key: string, value: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value) next.delete(key);
      else next.set(key, value);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      ['streamId', 'dateFrom', 'dateTo'].forEach((k) => next.delete(k));
      return next;
    });
  };

  const { data: streamsResponse } = useQuery({
    queryKey: ['streams', 'alive', 'home-filters'],
    queryFn: () => streamsApi.getAll({ scope: 'alive', limit: 500 }),
    enabled: filtersMounted,
  });
  const streams = streamsResponse?.data ?? [];

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics', 'dashboard', streamId, dateFrom, dateTo],
    queryFn: () =>
      dashboardApi.getDashboardStats({
        streamId:
          streamId && !Number.isNaN(Number(streamId))
            ? Number(streamId)
            : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });

  const { data: recentFilterLogsResponse, isLoading: recentLogsLoading } = useQuery({
    queryKey: ['logs', 'home', 'recent', streamId, dateFrom, dateTo],
    queryFn: () =>
      logsApi.getFilterLogs({
        page: 1,
        limit: 5,
        sort: 'desc',
        streamId: streamId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });
  const recentFilterLogs = recentFilterLogsResponse?.data ?? [];

  const stats = useMemo(() => {
    return {
      total: dashboardStats?.total ?? 0,
      allowed: dashboardStats?.allowed ?? 0,
      blocked: dashboardStats?.blocked ?? 0,
      passRate: dashboardStats?.passRate,
      passRateText: dashboardStats?.passRateText,
    };
  }, [dashboardStats]);

  if (statsLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  const passRateText =
    stats.passRateText ??
    (stats.passRate != null
      ? String(stats.passRate)
      : stats.total > 0
        ? String(Math.round(((stats.allowed / stats.total) * 100) * 100) / 100)
        : '0');

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">{t('home.title')}</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {t('home.welcomeBack')}{' '}
              <span className="font-medium text-zinc-200">{user?.name ?? user?.email}</span>
            </p>
          </div>

          <div className="relative" ref={filtersRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                filtersOpen
                  ? 'border-brand-500 bg-zinc-900 text-zinc-100'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:border-brand-500'
              }`}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {filtersActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-zinc-950" />
              )}
            </button>

            {filtersMounted && (
              <div
                className={`absolute right-0 mt-2 z-50 w-[min(60vw,720px)] max-w-[calc(25vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-4 overflow-visible origin-top-right transition-all duration-150 ease-out ${
                  filtersVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-1 scale-95 pointer-events-none'
                }`}
              >
                <div className="space-y-2 w-full">
                  <div className="relative w-full">
                    <select
                      value={streamId}
                      onChange={(e) => updateParam('streamId', e.target.value || undefined)}
                      className="w-full px-3 py-2 pr-10 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors appearance-none"
                    >
                      <option value="">{t('logs.allStreams')}</option>
                      {streams.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {`${s.name} (ID: ${s.id})`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  </div>

                  <div className="w-full [&_.react-datepicker-wrapper]:block [&_.react-datepicker-wrapper]:w-full">
                    <DatePicker
                      placeholderText={t('logs.dateFrom')}
                      dateFormat="dd.MM.yyyy"
                      selected={dateFrom ? new Date(dateFrom) : null}
                      onChange={(d: Date | null) =>
                        updateParam('dateFrom', d ? d.toISOString().slice(0, 10) : undefined)
                      }
                      isClearable
                      todayButton={t('common.today')}
                      calendarClassName="datepicker-dark-theme"
                      popperClassName="datepicker-dark-theme-popper"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors"
                    />
                  </div>

                  <div className="w-full [&_.react-datepicker-wrapper]:block [&_.react-datepicker-wrapper]:w-full">
                    <DatePicker
                      placeholderText={t('logs.dateTo')}
                      dateFormat="dd.MM.yyyy"
                      selected={dateTo ? new Date(dateTo) : null}
                      onChange={(d: Date | null) =>
                        updateParam('dateTo', d ? d.toISOString().slice(0, 10) : undefined)
                      }
                      isClearable
                      todayButton={t('common.today')}
                      calendarClassName="datepicker-dark-theme"
                      popperClassName="datepicker-dark-theme-popper"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t('common.clearFilters')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">{t('home.totalVisits')}</p>
              <Activity className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{stats.total}</div>
            <p className="text-xs text-zinc-500">{t('home.acrossAllStreams')}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">{t('home.allowed')}</p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{stats.allowed}</div>
            <p className="text-xs text-emerald-600">{t('home.legitimateTraffic')}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">{t('home.blocked')}</p>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{stats.blocked}</div>
            <p className="text-xs text-red-600">{t('home.suspiciousActivity')}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">{t('home.passRate')}</p>
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-100">
                %
              </div>
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{passRateText}%</div>
            <p className="text-xs text-zinc-500">{t('home.allowedVsTotal')}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">{t('home.latestFilterLogs')}</h2>
          {recentLogsLoading ? (
            <div className="text-center py-8 text-zinc-500 text-sm">{t('common.loading')}</div>
          ) : recentFilterLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">{t('home.noLatestFilterLogs')}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-zinc-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('common.time')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('logs.stream')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('common.status')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('common.reason')}
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentFilterLogs.map((log) => (
                    <tr
                      key={String(log.id)}
                      className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-200">
                          {log.streamName ?? `Stream #${log.streamId}`}
                        </div>
                        <div className="text-xs text-zinc-500">ID: {log.streamId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            log.passed
                              ? 'px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs rounded'
                              : 'px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded'
                          }
                        >
                          {log.passed ? t('logs.passed') : t('logs.blocked')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400 max-w-xs truncate">
                        {log.reason ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(log.metadata !== undefined && log.metadata !== null) && (
                          <button
                            onClick={() => setDetailLog(log)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-brand-400 hover:text-brand-300 hover:bg-zinc-800 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {t('common.view')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!detailLog}
        title={t('logs.logDetails')}
        onClose={() => setDetailLog(null)}
      >
        {detailLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('common.time')}</h3>
                <p className="text-sm text-zinc-200">
                  {new Date(detailLog.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.stream')}</h3>
                <p className="text-sm font-medium text-zinc-200">
                  {detailLog.streamName ?? `Stream #${detailLog.streamId}`}
                </p>
                <p className="text-xs text-zinc-500">ID: {detailLog.streamId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('common.status')}</h3>
                <span
                  className={
                    detailLog.passed
                      ? 'px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs rounded'
                      : 'px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded'
                  }
                >
                  {detailLog.passed ? t('logs.passed') : t('logs.blocked')}
                </span>
              </div>
              {detailLog.reason && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('common.reason')}</h3>
                  <p className="text-sm text-zinc-200">{detailLog.reason}</p>
                </div>
              )}
            </div>
            {detailLog.metadata !== null && detailLog.metadata !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.fullMetadata')}</h3>
                <pre className="text-xs text-zinc-300 overflow-auto max-h-64 p-3 bg-zinc-950 rounded border border-zinc-800">
                  {typeof detailLog.metadata === 'object'
                    ? JSON.stringify(detailLog.metadata, null, 2)
                    : String(detailLog.metadata)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}
