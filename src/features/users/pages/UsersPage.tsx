import { useTranslation } from 'react-i18next';
import { Layout } from '../../../shared/ui/Layout';
import { Users } from 'lucide-react';
import { EmptyState } from '../../../shared/ui/EmptyState';

export function UsersPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-100">{t('users.title')}</h1>
        <EmptyState
          icon={Users}
          title={t('users.usersManagement')}
          description={t('users.usersManagementDesc')}
        />
      </div>
    </Layout>
  );
}
