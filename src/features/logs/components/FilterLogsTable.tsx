import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Eye, FileText } from 'lucide-react';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { logsApi } from '../api';
import { streamsApi } from '../../streams/api';
import type { FilterLog } from '../../../shared/lib/zod-schemas';

const LIMIT = 50;

export function FilterLogsTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [metadataModal, setMetadataModal] = useState<FilterLog | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';
  const streamIds = searchParams.get('streamIds') || undefined;

  const { data: streams = [] } = useQuery({
    queryKey: ['streams', 'alive'],
    queryFn: () => streamsApi.getAll({ scope: 'alive', limit: 500 }),
  });

  const streamNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    streams.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [streams]);

  const { data, isLoading } = useQuery({
    queryKey: ['logs', 'filter', page, sort, streamIds],
    queryFn: () =>
      logsApi.getFilterLogs({
        page,
        limit: LIMIT,
        sort,
        streamIds: streamIds || undefined,
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

  const handleStreamFilter = (streamId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (streamId) {
        next.set('streamIds', streamId);
      } else {
        next.delete('streamIds');
      }
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
        <h2 className="text-xl font-semibold text-zinc-100">Filter Logs</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={streamIds ?? ''}
            onChange={(e) => handleStreamFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All streams</option>
            {streams.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={handleSortToggle}>
            Sort: {sort === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No filter logs yet"
          description="Logs will appear here when traffic passes through your streams"
        />
      ) : (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    Time
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    Stream
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    Reason
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {streamNameMap[log.streamId] ?? `Stream #${log.streamId}`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          log.passed
                            ? 'px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs rounded'
                            : 'px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded'
                        }
                      >
                        {log.passed ? 'Allowed' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 max-w-xs truncate">
                      {log.reason ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.metadata !== undefined && log.metadata !== null && (
                        <button
                          onClick={() => setMetadataModal(log)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-brand-400 hover:text-brand-300 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Page {page}
              {data?.total != null && ` of ${Math.ceil(data.total / LIMIT)}`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(page + 1)}
                disabled={!canNextPage}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={!!metadataModal}
        title="Log metadata"
        onClose={() => setMetadataModal(null)}
      >
        {metadataModal && (
          <pre className="text-sm text-zinc-300 overflow-auto max-h-[70vh] p-2 bg-zinc-950 rounded border border-zinc-800">
            {JSON.stringify(metadataModal.metadata, null, 2)}
          </pre>
        )}
      </Modal>
    </div>
  );
}
