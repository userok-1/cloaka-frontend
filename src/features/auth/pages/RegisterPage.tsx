import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserRegisterDto, UserRegisterDtoSchema } from '../../../shared/lib/zod-schemas';
import { authApi } from '../api';
import { useAuthStore } from '../store';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/toast';
import { useState } from 'react';

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserRegisterDto>({
    resolver: zodResolver(UserRegisterDtoSchema),
  });

  const onSubmit = async (data: UserRegisterDto) => {
    setIsLoading(true);
    try {
      const user = await authApi.register(data);
      setUser(user);
      toast.success('Account created successfully');
      navigate('/streams');
    } catch {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-zinc-100 mb-2">cloaka</h1>
          <p className="text-zinc-400">Create your account</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Name"
              type="text"
              placeholder="Your name"
              error={errors.name?.message}
              {...register('name')}
            />

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
              placeholder="At least 8 characters with letter and digit"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
