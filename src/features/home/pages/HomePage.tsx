import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { logsApi } from '../../logs/api';
import { streamsApi } from '../../streams/api';
import { useAuthStore } from '../../auth/store';

export function HomePage() {
  const { user } = useAuthStore();

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['streams', 'home'],
    queryFn: () => streamsApi.getAll({ limit: 100, scope: 'alive' }),
  });

  const { data: filterLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs', 'home'],
    queryFn: () => logsApi.getFilterLogs({ limit: 1000, page: 1 }),
  });

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

  if (streamsLoading || logsLoading) {
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
          <h1 className="text-2xl font-semibold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Welcome back, <span className="font-medium text-zinc-200">{user?.email}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Total Visits</p>
              <Activity className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{stats.total}</div>
            <p className="text-xs text-zinc-500">Across all streams</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Allowed</p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{stats.allowed}</div>
            <p className="text-xs text-emerald-600">Legitimate traffic</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Blocked</p>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{stats.blocked}</div>
            <p className="text-xs text-red-600">Suspicious activity</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-400">Pass Rate</p>
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-100">
                {passRate}%
              </div>
            </div>
            <div className="text-3xl font-semibold text-zinc-100">{passRate}%</div>
            <p className="text-xs text-zinc-500">Allowed vs total</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Active Streams</h2>
          {streams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">No active streams yet</p>
              <p className="text-sm text-zinc-500 mt-1">Create your first stream to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {streams.slice(0, 5).map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between p-3 bg-zinc-800/30 hover:bg-zinc-800/50 rounded-lg transition-colors border border-zinc-800/50"
                >
                  <div>
                    <p className="font-medium text-zinc-100">{stream.name}</p>
                    <p className="text-xs text-zinc-500">{stream.mode} mode</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">
                      {new Date(stream.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {streams.length > 5 && (
                <p className="text-xs text-zinc-500 pt-2">
                  and {streams.length - 5} more...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
