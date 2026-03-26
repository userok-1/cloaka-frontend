import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Calendar, LogOut, Eye, EyeOff, Hash } from 'lucide-react';
import { z } from 'zod';
import { useAuthStore } from '../store';
import { authApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { toast } from '../../../shared/ui/toast';
import { ApiError } from '../../../shared/api/client';
import {
  createChangePasswordFormSchema,
  createUpdateProfileSchema,
} from '../../../shared/lib/validation-schemas';

type UpdateProfileFormValues = z.infer<ReturnType<typeof createUpdateProfileSchema>>;
type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordFormSchema>>;

type ProfileTab = 'general' | 'edit';

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout: clearUser, setUser } = useAuthStore();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('general');

  const updateProfileSchema = useMemo(() => createUpdateProfileSchema(t), [t, i18n.language]);
  const changePasswordSchema = useMemo(() => createChangePasswordFormSchema(t), [t, i18n.language]);

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: user
      ? { name: user.name ?? '', email: user.email }
      : { name: '', email: '' },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

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

  const onProfileSubmit = async (data: UpdateProfileFormValues) => {
    const nameTrim = data.name.trim();
    setProfileLoading(true);
    try {
      const updated = await authApi.updateProfile({
        email: data.email.trim(),
        ...(nameTrim ? { name: nameTrim } : {}),
      });
      setUser(updated);
      profileForm.reset({ name: updated.name ?? '', email: updated.email });
      toast.success(t('profile.profileUpdated'));
    } catch (e) {
      if (!(e instanceof ApiError) || e.status === 0) {
        toast.error(t('profile.profileUpdateFailed'));
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormValues) => {
    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success(t('profile.passwordChanged'));
    } catch (e) {
      if (!(e instanceof ApiError) || e.status === 0) {
        toast.error(t('profile.passwordChangeFailed'));
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const dateLocale = i18n.language === 'uk' ? 'uk-UA' : 'en-US';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-6">{t('profile.title')}</h1>
          <div className="border-b border-zinc-800">
            <div className="flex gap-8">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'general'
                    ? 'text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {t('profile.tabGeneral')}
                {activeTab === 'general' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                  activeTab === 'edit' ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {t('profile.tabEdit')}
                {activeTab === 'edit' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-6">
          {activeTab === 'general' && (
            <>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-5">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                  {t('profile.accountSection')}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Hash className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-500 mb-0.5">{t('profile.userId')}</div>
                      <div className="text-zinc-100 font-mono text-sm">{user.id}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <User className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-500 mb-0.5">{t('common.name')}</div>
                      <div className="text-zinc-100 text-sm">
                        {user.name?.trim() ? user.name : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-500 mb-0.5">{t('common.email')}</div>
                      <div className="text-zinc-100 text-sm break-all">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Shield className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-500 mb-0.5">{t('common.role')}</div>
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

                  <div className="flex items-start gap-4">
                    <Calendar className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-500 mb-0.5">{t('profile.memberSince')}</div>
                      <div className="text-zinc-100 text-sm">
                        {new Date(user.createdAt).toLocaleDateString(dateLocale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </div>
            </>
          )}

          {activeTab === 'edit' && (
            <>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">{t('profile.profileDetails')}</h2>
                  <p className="text-sm text-zinc-500 mt-1">{t('profile.profileDetailsHint')}</p>
                </div>

                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <Input
                    label={t('common.name')}
                    type="text"
                    placeholder={t('profile.namePlaceholder')}
                    error={profileForm.formState.errors.name?.message}
                    {...profileForm.register('name')}
                  />

                  <Input
                    label={t('common.email')}
                    type="email"
                    autoComplete="email"
                    error={profileForm.formState.errors.email?.message}
                    {...profileForm.register('email')}
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={profileLoading}>
                      {profileLoading ? t('common.loading') : t('common.save')}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">{t('profile.changePassword')}</h2>
                  <p className="text-sm text-zinc-500 mt-1">{t('profile.changePasswordHint')}</p>
                </div>

                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <Input
                    label={t('profile.currentPassword')}
                    type={showCurrent ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={passwordForm.formState.errors.currentPassword?.message}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        aria-label={showCurrent ? 'Hide' : 'Show'}
                      >
                        {showCurrent ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    }
                    {...passwordForm.register('currentPassword')}
                  />

                  <Input
                    label={t('profile.newPassword')}
                    type={showNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('auth.passwordHint')}
                    error={passwordForm.formState.errors.newPassword?.message}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        aria-label={showNew ? 'Hide' : 'Show'}
                      >
                        {showNew ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    }
                    {...passwordForm.register('newPassword')}
                  />

                  <Input
                    label={t('profile.confirmNewPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="text-zinc-400 hover:text-zinc-200 transition-colors"
                        aria-label={showConfirm ? 'Hide' : 'Show'}
                      >
                        {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    }
                    {...passwordForm.register('confirmPassword')}
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? t('common.loading') : t('profile.savePassword')}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
