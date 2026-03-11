import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Activity, Eye } from 'lucide-react';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { Modal } from '../../../shared/ui/Modal';
import { logsApi } from '../../logs/api';
import { useAuthStore } from '../../auth/store';
import type { FilterLog } from '../../../shared/lib/zod-schemas';

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [detailLog, setDetailLog] = useState<FilterLog | null>(null);

  const { data: filterLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs', 'home'],
    queryFn: () => logsApi.getFilterLogs({ limit: 1000, page: 1 }),
  });

  const { data: recentFilterLogsResponse, isLoading: recentLogsLoading } = useQuery({
    queryKey: ['logs', 'home', 'recent'],
    queryFn: () => logsApi.getFilterLogs({ page: 1, limit: 5, sort: 'desc' }),
  });
  const recentFilterLogs = recentFilterLogsResponse?.data ?? [];

  const stats = useMemo(() => {
    if (!filterLogs?.data) {
      return { total: 0, allowed: 0, blocked: 0 };
    }

    const logs = filterLogs.data;
    const total = logs.length;
    const allowed = logs.filter((log) => log.passed).length;
    const blocked = total - allowed;

    return { total, allowed, blocked };
  }, [filterLogs]);

  if (logsLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  const passRate = stats.total > 0 ? Math.round((stats.allowed / stats.total) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{t('home.title')}</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {t('home.welcomeBack')} <span className="font-medium text-zinc-200">{user?.name ?? user?.email}</span>
          </p>
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
            <div className="text-3xl font-semibold text-zinc-100">{passRate}%</div>
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
