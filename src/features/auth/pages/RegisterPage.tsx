import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserRegisterDto } from '../../../shared/lib/zod-schemas';
import { createRegisterSchema } from '../../../shared/lib/validation-schemas';
import { authApi } from '../api';
import { useAuthStore } from '../store';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/toast';
import { LanguageSwitcher } from '../../../shared/ui/LanguageSwitcher';
import logoImg from '../../../img/cloaka.png';

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(() => createRegisterSchema(t), [t, i18n.language]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserRegisterDto>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: UserRegisterDto) => {
    setIsLoading(true);
    try {
      const user = await authApi.register(data);
      setUser(user);
      toast.success(t('auth.registerSuccess'));
      navigate('/streams');
    } catch {
      toast.error(t('auth.registerFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoImg} alt="cloaka" className="h-auto mx-auto mb-4" />
          <p className="text-zinc-400">{t('auth.createAccount')}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label={t('common.name')}
              type="text"
              placeholder={t('auth.yourName')}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label={t('common.email')}
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label={t('common.password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordHint')}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              }
              {...register('password')}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth.creatingAccount') : t('auth.signUp')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
