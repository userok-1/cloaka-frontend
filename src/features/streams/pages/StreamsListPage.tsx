import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, Copy } from 'lucide-react';
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
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['streams', 'alive'],
    queryFn: () => streamsApi.getAll({ scope: 'alive' }),
  });

  const trashMutation = useMutation({
    mutationFn: streamsApi.trash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream moved to trash');
    },
  });

  const handleTrash = async (stream: Stream) => {
    const confirmed = await confirmDialog({
      title: 'Move to trash',
      description: `Are you sure you want to move "${stream.name}" to trash? You can restore it later.`,
      confirmText: 'Move to trash',
      variant: 'default',
    });

    if (confirmed) {
      trashMutation.mutate(stream.id);
    }
  };

  const handleCopyUrl = (streamId: number) => {
    const url = `${window.location.origin}/api/r/${streamId}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-semibold text-zinc-100">Streams</h1>
          <Link to="/streams/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Stream
            </Button>
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search streams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        {filteredStreams.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No streams yet"
            description="Create your first stream to start filtering traffic"
            action={
              <Link to="/streams/new">
                <Button>Create Stream</Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Mode</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">
                    Landing URL
                  </th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">
                    Actions
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
                          title="Copy redirect URL"
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
      </div>
    </Layout>
  );
}
