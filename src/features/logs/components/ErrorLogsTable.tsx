import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Eye, AlertTriangle, ChevronDown, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Modal } from '../../../shared/ui/Modal';
import { logsApi } from '../api';
import { formatMetadataForDisplay } from '../../../shared/lib/format-metadata';
import type { ErrorLog } from '../../../shared/lib/zod-schemas';

const LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;
const ERR = 'err';

export function ErrorLogsTable() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedLog, setExpandedLog] = useState<ErrorLog | null>(null);

  const urlSearch = searchParams.get(`${ERR}Search`) ?? '';
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pendingRestoreFocusRef = useRef(false);
  const prevFetchingRef = useRef(false);

  const page = Math.max(1, parseInt(searchParams.get(`${ERR}Page`) || '1', 10));
  const sort = (searchParams.get(`${ERR}Sort`) as 'asc' | 'desc') || 'desc';
  const dateFrom = searchParams.get(`${ERR}DateFrom`) ?? '';
  const dateTo = searchParams.get(`${ERR}DateTo`) ?? '';

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (searchInput === urlSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      pendingRestoreFocusRef.current = true;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput.trim()) {
          next.set(`${ERR}Search`, searchInput.trim());
          next.set(`${ERR}Page`, '1');
        } else {
          next.delete(`${ERR}Search`);
          next.delete(`${ERR}Page`);
        }
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, urlSearch, setSearchParams]);

  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortDropdownOpen]);

  const updateParam = (key: string, value: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(`${ERR}Page`);
      if (value === '' || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['logs', 'errors', page, sort, urlSearch, dateFrom, dateTo],
    queryFn: () =>
      logsApi.getErrors({
        page,
        limit: LIMIT,
        sort,
        search: urlSearch.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;
  const isInitialLoading = isLoading && !data;

  useEffect(() => {
    if (prevFetchingRef.current && !isFetching && pendingRestoreFocusRef.current) {
      pendingRestoreFocusRef.current = false;
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
    prevFetchingRef.current = isFetching;
  }, [isFetching]);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(`${ERR}Page`, String(newPage));
      return next;
    });
  };

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      [`${ERR}Search`, `${ERR}Page`, `${ERR}Sort`, `${ERR}DateFrom`, `${ERR}DateTo`].forEach((k) =>
        next.delete(k)
      );
      return next;
    });
    setSearchInput('');
  };

  if (isInitialLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={t('common.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors"
        />
        <div className="flex gap-2 flex-wrap items-center w-full">
          <div className="flex-1 min-w-[140px] min-w-0 [&_.react-datepicker-wrapper]:block [&_.react-datepicker-wrapper]:w-full">
            <DatePicker
              placeholderText={t('logs.dateFrom')}
              dateFormat="dd.MM.yyyy"
              selected={dateFrom ? new Date(dateFrom) : null}
              onChange={(d: Date | null) =>
                updateParam(`${ERR}DateFrom`, d ? d.toISOString().slice(0, 10) : undefined)
              }
              isClearable
              todayButton={t('common.today')}
              calendarClassName="datepicker-dark-theme"
              popperClassName="datepicker-dark-theme-popper"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex-1 min-w-[140px] min-w-0 [&_.react-datepicker-wrapper]:block [&_.react-datepicker-wrapper]:w-full">
            <DatePicker
              placeholderText={t('logs.dateTo')}
              dateFormat="dd.MM.yyyy"
              selected={dateTo ? new Date(dateTo) : null}
              onChange={(d: Date | null) =>
                updateParam(`${ERR}DateTo`, d ? d.toISOString().slice(0, 10) : undefined)
              }
              isClearable
              todayButton={t('common.today')}
              calendarClassName="datepicker-dark-theme"
              popperClassName="datepicker-dark-theme-popper"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors"
            />
          </div>
          <div className="relative flex-1 min-w-[120px]" ref={sortDropdownRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors text-left min-w-0 ${
                sortDropdownOpen ? 'border-brand-500' : 'border-zinc-700'
              }`}
            >
              <span className="truncate min-w-0">
                {sort === 'desc' ? t('logs.sortNewest') : t('logs.sortOldest')}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {sortDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
                <div className="max-h-60 overflow-y-auto py-1">
                  {(['desc', 'asc'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        updateParam(`${ERR}Sort`, s);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                        sort === s ? 'bg-zinc-800 text-brand-400' : 'text-zinc-200'
                      }`}
                    >
                      {s === 'desc' ? t('logs.sortNewest') : t('logs.sortOldest')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
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

      {logs.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={t('logs.noErrorLogs')}
          description={t('logs.noErrorLogsDesc')}
        />
      ) : (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400 w-[185px] whitespace-nowrap align-middle">
                    {t('common.time')}
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400 w-[86px] whitespace-nowrap align-middle">
                    {t('common.status')}
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400 w-[260px] align-middle">
                    {t('logs.context')}
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400 w-[260px] align-middle">
                    {t('logs.message')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-zinc-400 w-[140px] whitespace-nowrap align-middle">
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
                      <td className="px-6 py-4 text-sm text-zinc-300 whitespace-nowrap align-middle">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 align-middle">
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
                      <td className="px-6 py-4 text-sm text-zinc-400 truncate align-middle">
                        {location || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-300 truncate align-middle">
                        {log.message}
                      </td>
                      <td className="px-4 py-4 text-left whitespace-nowrap align-middle">
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

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-zinc-400">
              {t('common.page')}{' '}
              <span className="font-medium text-zinc-100">{page}</span>{' '}
              {t('common.of')}{' '}
              <span className="font-medium text-zinc-100">{totalPages}</span>
              {total > 0 && (
                <span className="ml-2">
                  · {total} {t('logs.totalLogs')}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> {t('common.prev')}
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.next')} <ChevronRight className="w-4 h-4" />
              </button>
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
                <pre className="text-xs text-zinc-300 overflow-y-auto max-h-[min(70vh,24rem)] p-3 bg-zinc-950 rounded border border-zinc-800 whitespace-pre-wrap break-words">
                  {formatMetadataForDisplay(expandedLog.metadata)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
