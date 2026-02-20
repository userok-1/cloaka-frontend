import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Eye, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { streamsApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Button } from '../../../shared/ui/Button';
import { confirmDialog } from '../../../shared/ui/ConfirmDialog';
import { toast } from '../../../shared/ui/toast';
import { Stream } from '../../../shared/lib/zod-schemas';
import { useState } from 'react';

export function StreamsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['streams', 'alive', page],
    queryFn: () => streamsApi.getAll({ scope: 'alive', page, limit }),
  });

  const trashMutation = useMutation({
    mutationFn: streamsApi.trash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success(t('streams.movedToTrash'));
    },
  });

  const handleTrash = async (stream: Stream) => {
    const confirmed = await confirmDialog({
      title: t('streams.moveToTrash'),
      description: t('streams.moveToTrashConfirm', { name: stream.name }),
      confirmText: t('streams.moveToTrash'),
      variant: 'default',
    });

    if (confirmed) {
      trashMutation.mutate(stream.id);
    }
  };

  const handleCopyUrl = (streamId: number) => {
    const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
    const url = `${base.replace(/\/$/, '')}/r/${streamId}`;
    navigator.clipboard.writeText(url);
    toast.success(t('streams.urlCopied'));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canNextPage = streams.length === limit;

  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-100">{t('streams.title')}</h1>
          <Link to="/streams/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('streams.createStream')}
            </Button>
          </Link>
        </div>

        <input
          type="text"
          placeholder={t('streams.searchStreams')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {filteredStreams.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={t('streams.noStreams')}
            description={t('streams.noStreamsDesc')}
            action={
              <Link to="/streams/new">
                <Button>{t('streams.createStream')}</Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">{t('common.name')}</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">{t('common.mode')}</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    {t('streams.offerUrl')}
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStreams.map((stream) => (
                  <tr
                    key={stream.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-200">{stream.name}</div>
                      <div className="text-xs text-zinc-500">ID: {stream.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded capitalize">
                        {stream.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-400 truncate max-w-xs">
                        {stream.landingUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyUrl(stream.id)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                          title={t('streams.copyRedirectUrl')}
                        >
                          <Copy className="w-4 h-4 text-zinc-400" />
                        </button>
                        <Link
                          to={`/streams/${stream.id}`}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-zinc-400" />
                        </Link>
                        <button
                          onClick={() => handleTrash(stream)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredStreams.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-zinc-400">
              {t('common.page')} <span className="font-medium text-zinc-100">{page}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> {t('common.prev')}
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!canNextPage}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.next')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
