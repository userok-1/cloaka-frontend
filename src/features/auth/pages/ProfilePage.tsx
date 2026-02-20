import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { useAuthStore } from '../store';
import { authApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/toast';

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout: clearUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch {
      toast.error(t('auth.logoutFailed'));
    }
  };

  if (!user) {
    return null;
  }

  const dateLocale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-100">{t('profile.title')}</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <User className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">{t('profile.userId')}</div>
                <div className="text-zinc-100">{user.id}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">{t('common.email')}</div>
                <div className="text-zinc-100">{user.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">{t('common.role')}</div>
                <div className="capitalize">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      user.role === 'admin'
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {t(`roles.${user.role}`)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">{t('profile.memberSince')}</div>
                <div className="text-zinc-100">
                  {new Date(user.createdAt).toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
