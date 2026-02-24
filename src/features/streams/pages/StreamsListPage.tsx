import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Eye, Copy, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { streamsApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Button } from '../../../shared/ui/Button';
import { confirmDialog } from '../../../shared/ui/ConfirmDialog';
import { toast } from '../../../shared/ui/toast';
import { Stream } from '../../../shared/lib/zod-schemas';
import type { GetStreamsDto } from '../../../shared/lib/zod-schemas';

const LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

type StreamScope = 'alive' | 'deleted' | 'all';
type StreamMode = 'redirect' | 'fingerprint';

export function StreamsListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (searchInput === urlSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        next.set('search', searchInput.trim());
        next.set('page', '1');
      } else {
        next.delete('search');
        next.delete('page');
      }
      setSearchParams(next);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, urlSearch, searchParams, setSearchParams]);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const scope = (searchParams.get('scope') || 'alive') as StreamScope;
  const mode = searchParams.get('mode') as StreamMode | null;
  const geo = searchParams.get('geo') ?? '';
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo = searchParams.get('dateTo') ?? '';

  const params: Partial<GetStreamsDto> = {
    page,
    limit: LIMIT,
    scope,
    ...(urlSearch.trim() ? { search: urlSearch.trim() } : {}),
    ...(mode === 'redirect' || mode === 'fingerprint' ? { mode } : {}),
    ...(geo.length === 2 ? { geo: geo.toUpperCase() } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['streams', params],
    queryFn: () => streamsApi.getAll(params),
  });

  const streams = data?.data ?? [];
  const totalPages = data?.pages ?? 0;
  const totalFiltered = data?.totalFiltered ?? data?.total ?? 0;
  const isInitialLoading = isLoading && !data;

  const updateParam = (key: string, value: string | number) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || (key === 'page' && value === 1)) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

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

        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors"
          />
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative">
              <select
                value={scope}
                onChange={(e) => updateParam('scope', e.target.value)}
                className="w-full min-w-[100px] pl-3 pr-9 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors appearance-none"
              >
                <option value="alive">{t('streams.scopeAlive')}</option>
                <option value="deleted">{t('streams.scopeDeleted')}</option>
                <option value="all">{t('streams.scopeAll')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 w-4 h-4 -translate-y-1/2 pointer-events-none text-zinc-400 shrink-0" />
            </div>
            <div className="relative">
              <select
                value={mode ?? ''}
                onChange={(e) => updateParam('mode', e.target.value)}
                className="w-full min-w-[110px] pl-3 pr-9 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors appearance-none"
              >
                <option value="">{t('streams.filterMode')}</option>
                <option value="redirect">Redirect</option>
                <option value="fingerprint">Fingerprint</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 w-4 h-4 -translate-y-1/2 pointer-events-none text-zinc-400 shrink-0" />
            </div>
            <input
              type="text"
              placeholder={t('streams.filterGeo')}
              value={geo}
              onChange={(e) => updateParam('geo', e.target.value.slice(0, 2).toUpperCase())}
              maxLength={2}
              className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors uppercase"
            />
            <input
              type="date"
              placeholder={t('streams.dateFrom')}
              value={dateFrom}
              onChange={(e) => updateParam('dateFrom', e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors"
            />
            <input
              type="date"
              placeholder={t('streams.dateTo')}
              value={dateTo}
              onChange={(e) => updateParam('dateTo', e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {isInitialLoading ? (
          <LoadingState />
        ) : streams.length === 0 ? (
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
          <>
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
                {streams.map((stream) => (
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

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-zinc-400">
                {t('common.page')}{' '}
                <span className="font-medium text-zinc-100">{page}</span>
                {totalPages > 0 && (
                  <> {t('common.of')} <span className="font-medium text-zinc-100">{totalPages}</span></>
                )}
                {totalFiltered > 0 && (
                  <span className="ml-2">
                    · {totalFiltered} {t('streams.totalStreams')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateParam('page', page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> {t('common.prev')}
                </button>
                <button
                  onClick={() => updateParam('page', page + 1)}
                  disabled={totalPages > 0 ? page >= totalPages : streams.length < LIMIT}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.next')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
