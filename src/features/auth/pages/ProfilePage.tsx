import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { useAuthStore } from '../store';
import { authApi } from '../api';
import { Layout } from '../../../shared/ui/Layout';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/toast';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout: clearUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Profile</h1>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <User className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">User ID</div>
                <div className="text-zinc-100">{user.id}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">Email</div>
                <div className="text-zinc-100">{user.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">Role</div>
                <div className="capitalize">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      user.role === 'admin'
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400 mb-1">Member Since</div>
                <div className="text-zinc-100">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
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
              Logout
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
