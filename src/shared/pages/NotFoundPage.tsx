import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '../ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <FileQuestion className="w-16 h-16 text-zinc-600 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-zinc-100">Page Not Found</h1>
          <p className="text-zinc-400 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/streams')}>Go to Streams</Button>
        </div>
      </div>
    </div>
  );
}
