import { useState, useEffect } from 'react';
import { Layout } from '../../../shared/ui/Layout';
import { FilterLogsTable } from '../components/FilterLogsTable';
import { ErrorLogsTable } from '../components/ErrorLogsTable';
import { useAuthStore } from '../../auth/store';

type TabType = 'filter' | 'errors';

export function LogsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<TabType>('filter');

  useEffect(() => {
    if (!isAdmin && activeTab === 'errors') {
      setActiveTab('filter');
    }
  }, [isAdmin, activeTab]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-6">Logs</h1>
          <div className="border-b border-zinc-800">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('filter')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'filter'
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                Filter Logs
                {activeTab === 'filter' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                )}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('errors')}
                  className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                    activeTab === 'errors'
                      ? 'text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  Error Logs
                  {activeTab === 'errors' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          {activeTab === 'filter' && <FilterLogsTable />}
          {activeTab === 'errors' && isAdmin && <ErrorLogsTable />}
        </div>
      </div>
    </Layout>
  );
}
