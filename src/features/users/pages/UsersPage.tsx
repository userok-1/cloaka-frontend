import { Layout } from '../../../shared/ui/Layout';
import { Users } from 'lucide-react';
import { EmptyState } from '../../../shared/ui/EmptyState';

export function UsersPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Users</h1>
        <EmptyState
          icon={Users}
          title="Users management"
          description="User list and management will appear here"
        />
      </div>
    </Layout>
  );
}
