import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Eye, AlertTriangle } from 'lucide-react';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { logsApi } from '../api';
import type { ErrorLog } from '../../../shared/lib/zod-schemas';

const LIMIT = 50;

export function ErrorLogsTable() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedLog, setExpandedLog] = useState<ErrorLog | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';

  const { data, isLoading } = useQuery({
    queryKey: ['logs', 'errors', page, sort],
    queryFn: () =>
      logsApi.getErrors({
        page,
        limit: LIMIT,
        sort,
      }),
  });

  const logs = data?.data ?? [];
  const canNextPage = logs.length === LIMIT;

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  const handleSortToggle = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      next.set('sort', sort === 'desc' ? 'asc' : 'desc');
      return next;
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-zinc-100">{t('logs.errorLogs')}</h2>
        <Button variant="secondary" onClick={handleSortToggle}>
          {t('logs.sort')}: {sort === 'desc' ? t('logs.sortNewest') : t('logs.sortOldest')}
        </Button>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={t('logs.noErrorLogs')}
          description={t('logs.noErrorLogsDesc')}
        />
      ) : (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    {t('common.time')}
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    {t('common.status')}
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    {t('logs.context')}
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    {t('logs.message')}
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const location = [log.module, log.controller, log.handler]
                    .filter(Boolean)
                    .join(' › ');

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {log.statusCode && (
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              log.statusCode >= 500
                                ? 'bg-red-900/50 text-red-400'
                                : 'bg-orange-900/50 text-orange-400'
                            }`}
                          >
                            {log.statusCode}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400 max-w-xs truncate">
                        {location || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300 max-w-md truncate">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setExpandedLog(log)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-brand-400 hover:text-brand-300 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('logs.errorDetails')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {t('common.page')} {page}
              {data?.total != null && ` ${t('common.of')} ${Math.ceil(data.total / LIMIT)}`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('common.prev')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(page + 1)}
                disabled={!canNextPage}
              >
                {t('common.next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={!!expandedLog}
        title={t('logs.errorDetails')}
        onClose={() => setExpandedLog(null)}
      >
        {expandedLog && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.message')}</h3>
              <p className="text-sm text-zinc-200">{expandedLog.message}</p>
            </div>

            {expandedLog.statusCode && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('common.status')}</h3>
                <p className="text-sm text-zinc-200">{expandedLog.statusCode}</p>
              </div>
            )}

            {(expandedLog.module || expandedLog.controller || expandedLog.handler) && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.context')}</h3>
                <div className="text-sm text-zinc-200 space-y-1">
                  {expandedLog.module && <p>Module: {expandedLog.module}</p>}
                  {expandedLog.controller && <p>Controller: {expandedLog.controller}</p>}
                  {expandedLog.handler && <p>Handler: {expandedLog.handler}</p>}
                </div>
              </div>
            )}

            {expandedLog.stackTrace && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">Stack Trace</h3>
                <pre className="text-xs text-zinc-300 overflow-auto max-h-96 p-3 bg-zinc-950 rounded border border-zinc-800 whitespace-pre-wrap">
                  {expandedLog.stackTrace}
                </pre>
              </div>
            )}

            {expandedLog.metadata !== null && expandedLog.metadata !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.fullMetadata')}</h3>
                <pre className="text-xs text-zinc-300 overflow-auto max-h-64 p-3 bg-zinc-950 rounded border border-zinc-800">
                  {typeof expandedLog.metadata === 'object'
                    ? JSON.stringify(expandedLog.metadata, null, 2)
                    : String(expandedLog.metadata)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
