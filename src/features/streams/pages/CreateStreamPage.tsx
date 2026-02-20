import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { streamsApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { StreamForm } from '../components/StreamForm';
import { CreateStreamDto } from '../../../shared/lib/zod-schemas';
import { toast } from '../../../shared/ui/toast';

export function CreateStreamPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createMutation = useMutation({
    mutationFn: streamsApi.create,
    onSuccess: () => {
      toast.success('Stream created successfully');
      navigate('/streams');
    },
  });

  const handleSubmit = async (data: CreateStreamDto) => {
    setIsLoading(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/streams')}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to streams
        </button>

        <h1 className="text-2xl font-semibold text-zinc-100">Create Stream</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <StreamForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Stream"
          />
        </div>
      </div>
    </Layout>
  );
}
