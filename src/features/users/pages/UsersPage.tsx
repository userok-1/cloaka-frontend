import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { usersApi, type User, type UserRole } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';

const LIMIT = 10;

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

const SEARCH_DEBOUNCE_MS = 400;

export function UsersPage() {
  const { t } = useTranslation();
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
  const scope = (searchParams.get('scope') || 'alive') as 'alive' | 'deleted' | 'all';
  const role = searchParams.get('role') as UserRole | null;
  const sort = (searchParams.get('sort') || 'desc') as 'asc' | 'desc';

  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const scopeDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scopeDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (scopeDropdownRef.current && !scopeDropdownRef.current.contains(e.target as Node)) {
        setScopeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [scopeDropdownOpen]);

  useEffect(() => {
    if (!roleDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [roleDropdownOpen]);

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

  const params = {
    page,
    limit: LIMIT,
    sort,
    scope,
    ...(role ? { role } : {}),
    ...(urlSearch.trim() ? { search: urlSearch.trim() } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getList(params),
  });

  const updateParam = (key: string, value: string | number) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || (key === 'page' && value === 1)) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setSearchParams(next);
  };

  const users = data?.data ?? [];
  const totalPages = data?.pages ?? 0;
  const totalFiltered = data?.totalFiltered ?? 0;
  const isInitialLoading = isLoading && !data;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-100">{t('users.title')}</h1>

        <div className="flex gap-2 flex-wrap items-center w-full">
          <input
            type="text"
            placeholder={t('common.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors"
          />
            <div className="relative flex-1 min-w-[110px]" ref={scopeDropdownRef}>
              <button
                type="button"
                onClick={() => setScopeDropdownOpen((v) => !v)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors text-left min-w-0 ${
                  scopeDropdownOpen ? 'border-brand-500' : 'border-zinc-700'
                }`}
              >
                <span className="truncate min-w-0">
                  {scope === 'alive'
                    ? t('users.scopeAlive')
                    : scope === 'deleted'
                      ? t('users.scopeDeleted')
                      : t('users.scopeAll')}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${scopeDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {scopeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
                  <div className="max-h-60 overflow-y-auto py-1">
                    {(['alive', 'deleted', 'all'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          updateParam('scope', s);
                          setScopeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                          scope === s ? 'bg-zinc-800 text-brand-400' : 'text-zinc-200'
                        }`}
                      >
                        {s === 'alive'
                          ? t('users.scopeAlive')
                          : s === 'deleted'
                            ? t('users.scopeDeleted')
                            : t('users.scopeAll')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative flex-1 min-w-[110px]" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen((v) => !v)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset hover:border-brand-500 transition-colors text-left min-w-0 ${
                  roleDropdownOpen ? 'border-brand-500' : 'border-zinc-700'
                }`}
              >
                <span className="truncate min-w-0">
                  {role ? t(`roles.${role}`) : t('common.role')}
                </span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {roleDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
                  <div className="max-h-60 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => {
                        updateParam('role', '');
                        setRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
                    >
                      <X className="w-4 h-4 shrink-0" />
                      {t('common.role')}
                    </button>
                    {(['user', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          updateParam('role', r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                          role === r ? 'bg-zinc-800 text-brand-400' : 'text-zinc-200'
                        }`}
                      >
                        {t(`roles.${r}`)}
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
                  {sort === 'desc' ? t('users.sortDesc') : t('users.sortAsc')}
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
                        {s === 'desc' ? t('users.sortDesc') : t('users.sortAsc')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>

        {isInitialLoading ? (
          <LoadingState />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('users.noUsers')}
            description={t('users.noUsersDesc')}
          />
        ) : (
          <>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('common.name')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('common.email')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('common.role')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('users.createdAt')}
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                      {t('users.updatedAt')}
                    </th>
                    {(scope === 'deleted' || scope === 'all') && (
                      <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                        {t('users.deletedAt')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-200">
                          {user.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          ID: {user.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-300">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded capitalize ${
                            user.role === 'admin'
                              ? 'bg-brand-500/20 text-brand-400'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {t(`roles.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDate(user.updatedAt)}
                      </td>
                      {(scope === 'deleted' || scope === 'all') && (
                        <td className="px-6 py-4 text-sm text-zinc-400">
                          {formatDate(user.deletedAt)}
                        </td>
                      )}
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
                    · {totalFiltered} {t('users.totalUsers')}
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
                  disabled={totalPages > 0 ? page >= totalPages : users.length < LIMIT}
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
