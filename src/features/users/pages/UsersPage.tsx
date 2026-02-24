import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
                <option value="alive">{t('users.scopeAlive')}</option>
                <option value="deleted">{t('users.scopeDeleted')}</option>
                <option value="all">{t('users.scopeAll')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 w-4 h-4 -translate-y-1/2 pointer-events-none text-zinc-400 shrink-0" />
            </div>
            <div className="relative">
              <select
                value={role ?? ''}
                onChange={(e) => updateParam('role', e.target.value)}
                className="w-full min-w-[100px] pl-3 pr-9 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors appearance-none"
              >
                <option value="">{t('common.role')}</option>
                <option value="user">{t('roles.user')}</option>
                <option value="admin">{t('roles.admin')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 w-4 h-4 -translate-y-1/2 pointer-events-none text-zinc-400 shrink-0" />
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="w-full min-w-[120px] pl-3 pr-9 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-brand-500 transition-colors appearance-none"
              >
                <option value="desc">{t('users.sortDesc')}</option>
                <option value="asc">{t('users.sortAsc')}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 w-4 h-4 -translate-y-1/2 pointer-events-none text-zinc-400 shrink-0" />
            </div>
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
