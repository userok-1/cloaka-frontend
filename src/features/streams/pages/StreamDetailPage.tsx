import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { streamsApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { StreamForm } from '../components/StreamForm';
import { UpdateStreamDto } from '../../../shared/lib/zod-schemas';
import { toast } from '../../../shared/ui/toast';

export function StreamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: stream, isLoading: isLoadingStream } = useQuery({
    queryKey: ['streams', id],
    queryFn: () => streamsApi.getById(Number(id)),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateStreamDto) => streamsApi.update(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streams'] });
      toast.success('Stream updated successfully');
      navigate('/streams');
    },
  });

  const handleSubmit = async (data: UpdateStreamDto) => {
    setIsLoading(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingStream) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  if (!stream) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-zinc-400">Stream not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <button
          onClick={() => navigate('/streams')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to streams
        </button>

        <h1 className="text-2xl font-semibold text-zinc-100">Edit Stream</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <StreamForm
            defaultValues={stream}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Update Stream"
          />
        </div>
      </div>
    </Layout>
  );
}
