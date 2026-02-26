import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Eye, FileText, ChevronDown, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Modal } from '../../../shared/ui/Modal';
import { logsApi } from '../api';
import type { FilterLog } from '../../../shared/lib/zod-schemas';
import { FILTER_REASON_OPTIONS } from '../../../shared/constants/reasonCodes';

const LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

export function FilterLogsTable() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [metadataModal, setMetadataModal] = useState<FilterLog | null>(null);

  const urlSearch = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const sort = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';
  const streamIds = searchParams.get('streamIds') ?? '';
  const reasonParam = searchParams.get('reason');
  const reason = reasonParam ? parseInt(reasonParam, 10) : undefined;
  const passedParam = searchParams.get('passed');
  const passed =
    passedParam === 'true' ? true : passedParam === 'false' ? false : undefined;
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo = searchParams.get('dateTo') ?? '';

  const [reasonDropdownOpen, setReasonDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const reasonDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (searchInput === urlSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput.trim()) {
          next.set('search', searchInput.trim());
          next.set('page', '1');
        } else {
          next.delete('search');
          next.delete('page');
        }
        return next;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, urlSearch, setSearchParams]);

  useEffect(() => {
    if (!reasonDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (reasonDropdownRef.current && !reasonDropdownRef.current.contains(e.target as Node)) {
        setReasonDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [reasonDropdownOpen]);

  useEffect(() => {
    if (!statusDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusDropdownOpen]);

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

  const updateParam = (key: string, value: string | number | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (value === '' || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['logs', 'filter', page, sort, streamIds, urlSearch, reason, passed, dateFrom, dateTo],
    queryFn: () =>
      logsApi.getFilterLogs({
        page,
        limit: LIMIT,
        sort,
        streamIds: streamIds || undefined,
        search: urlSearch.trim() || undefined,
        reason,
        passed,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;
  const isInitialLoading = isLoading && !data;

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  const selectedReason = reason != null ? FILTER_REASON_OPTIONS.find((r) => r.value === reason) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
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
                updateParam('dateFrom', d ? d.toISOString().slice(0, 10) : undefined)
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
                updateParam('dateTo', d ? d.toISOString().slice(0, 10) : undefined)
              }
              isClearable
              todayButton={t('common.today')}
              calendarClassName="datepicker-dark-theme"
              popperClassName="datepicker-dark-theme-popper"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors"
            />
          </div>

          <div className="relative flex-1 min-w-[120px]" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors text-left min-w-0 ${
                statusDropdownOpen ? 'border-brand-500' : 'border-zinc-700'
              }`}
            >
              <span className="truncate min-w-0">
                {passed === true
                  ? t('logs.passed')
                  : passed === false
                    ? t('logs.blocked')
                    : t('logs.filterStatus')}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {statusDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
                <div className="max-h-60 overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateParam('passed', undefined);
                      setStatusDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    {t('logs.statusAny')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateParam('passed', 'true');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                      passed === true ? 'bg-zinc-800 text-brand-400' : 'text-zinc-200'
                    }`}
                  >
                    {t('logs.passed')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateParam('passed', 'false');
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                      passed === false ? 'bg-zinc-800 text-brand-400' : 'text-zinc-200'
                    }`}
                  >
                    {t('logs.blocked')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-1 min-w-[140px]" ref={reasonDropdownRef}>
            <button
              type="button"
              onClick={() => setReasonDropdownOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors text-left min-w-0 ${
                reasonDropdownOpen ? 'border-brand-500' : 'border-zinc-700'
              }`}
            >
              <span className="truncate min-w-0">
                {selectedReason ? t(selectedReason.labelKey) : t('logs.filterReason')}
              </span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${reasonDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {reasonDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[220px]">
                <div className="max-h-60 overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateParam('reason', undefined);
                      setReasonDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4 shrink-0" />
                    {t('logs.reasonAny')}
                  </button>
                  {FILTER_REASON_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        updateParam('reason', r.value);
                        setReasonDropdownOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                        reason === r.value ? 'bg-zinc-800 text-brand-400' : 'text-zinc-200'
                      }`}
                    >
                      {t(r.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                        updateParam('sort', s);
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
      </div>

      {isInitialLoading ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('logs.noFilterLogs')}
          description={t('logs.noFilterLogsDesc')}
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
                {logs.map((log) => (
                  <tr
                    key={log.id}
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
                      {log.metadata !== undefined && log.metadata !== null && (
                        <button
                          onClick={() => setMetadataModal(log)}
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
        isOpen={!!metadataModal}
        title={t('logs.logDetails')}
        onClose={() => setMetadataModal(null)}
      >
        {metadataModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('common.time')}</h3>
                <p className="text-sm text-zinc-200">
                  {new Date(metadataModal.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.stream')}</h3>
                <p className="text-sm font-medium text-zinc-200">
                  {metadataModal.streamName ?? `Stream #${metadataModal.streamId}`}
                </p>
                <p className="text-xs text-zinc-500">ID: {metadataModal.streamId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('common.status')}</h3>
                <span
                  className={
                    metadataModal.passed
                      ? 'px-2 py-1 bg-emerald-900/50 text-emerald-400 text-xs rounded'
                      : 'px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded'
                  }
                >
                  {metadataModal.passed ? t('logs.passed') : t('logs.blocked')}
                </span>
              </div>
              {metadataModal.reason && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('common.reason')}</h3>
                  <p className="text-sm text-zinc-200">{metadataModal.reason}</p>
                </div>
              )}
            </div>

            {metadataModal.metadata != null && typeof metadataModal.metadata === 'object' && (
              <>
                {(metadataModal.metadata as Record<string, unknown>).ip != null && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.ipAddress')}</h3>
                    <p className="text-sm text-zinc-200 font-mono">
                      {String((metadataModal.metadata as Record<string, unknown>).ip)}
                    </p>
                  </div>
                )}

                {(metadataModal.metadata as Record<string, unknown>).userAgent != null && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.userAgent')}</h3>
                    <p className="text-sm text-zinc-200 break-all">
                      {String((metadataModal.metadata as Record<string, unknown>).userAgent)}
                    </p>
                  </div>
                )}

                {(metadataModal.metadata as Record<string, unknown>).country != null && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.country')}</h3>
                    <p className="text-sm text-zinc-200">
                      {String((metadataModal.metadata as Record<string, unknown>).country)}
                    </p>
                  </div>
                )}
              </>
            )}

            {metadataModal.metadata !== null && metadataModal.metadata !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">{t('logs.fullMetadata')}</h3>
                <pre className="text-xs text-zinc-300 overflow-auto max-h-64 p-3 bg-zinc-950 rounded border border-zinc-800">
                  {typeof metadataModal.metadata === 'object'
                    ? JSON.stringify(metadataModal.metadata, null, 2)
                    : String(metadataModal.metadata)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
