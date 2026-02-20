import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserLoginDto, UserLoginDtoSchema } from '../../../shared/lib/zod-schemas';
import { authApi } from '../api';
import { useAuthStore } from '../store';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/toast';
import { useState } from 'react';
import logoImg from '../../../img/cloaka.png';

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginDto>({
    resolver: zodResolver(UserLoginDtoSchema),
  });

  const onSubmit = async (data: UserLoginDto) => {
    setIsLoading(true);
    try {
      const user = await authApi.login(data);
      setUser(user);
      toast.success('Logged in successfully');
      navigate('/streams');
    } catch {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoImg} alt="cloaka" className="h-auto mx-auto mb-4" />
          <p className="text-zinc-400">Sign in to your account</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
