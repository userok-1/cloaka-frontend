import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2, Inbox } from 'lucide-react';
import { streamsApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { confirmDialog } from '../../../shared/ui/ConfirmDialog';
import { toast } from '../../../shared/ui/toast';
import { Stream } from '../../../shared/lib/zod-schemas';

export function TrashPage() {
  const queryClient = useQueryClient();

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['streams', 'deleted'],
    queryFn: () => streamsApi.getAll({ scope: 'deleted' }),
  });

  const restoreMutation = useMutation({
    mutationFn: streamsApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream restored successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: streamsApi.deletePermanently,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream deleted permanently');
    },
  });

  const handleRestore = async (stream: Stream) => {
    const confirmed = await confirmDialog({
      title: 'Restore stream',
      description: `Are you sure you want to restore "${stream.name}"?`,
      confirmText: 'Restore',
      variant: 'default',
    });

    if (confirmed) {
      restoreMutation.mutate(stream.id);
    }
  };

  const handleDelete = async (stream: Stream) => {
    const confirmed = await confirmDialog({
      title: 'Delete permanently',
      description: `Are you sure you want to permanently delete "${stream.name}"? This action cannot be undone.`,
      confirmText: 'Delete permanently',
      variant: 'destructive',
    });

    if (confirmed) {
      deleteMutation.mutate(stream.id);
    }
  };

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
        <h1 className="text-2xl font-semibold text-zinc-100">Trash</h1>

        {streams.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Trash is empty"
            description="Deleted streams will appear here"
          />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Mode</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    Deleted At
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">
                    Actions
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
                      <div className="text-sm text-zinc-400">
                        {stream.deletedAt
                          ? new Date(stream.deletedAt).toLocaleDateString()
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(stream)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <RefreshCw className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(stream)}
                          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
