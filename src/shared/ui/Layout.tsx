import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Menu,
  User,
  Users,
  Trash2,
  LogOut,
  ChevronLeft,
  FileText,
  BookOpen,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/store';
import { authApi } from '../../features/auth/api';
import logoImg from '../../img/cloaka.png';
import { toast } from './toast';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem('sidebar-collapsed', String(newValue));
      return newValue;
    });
  };
  const location = useLocation();
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

  const navItems: { path: string; label: string; icon: typeof Home; adminOnly?: boolean }[] = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/users', label: 'Users', icon: Users, adminOnly: true },
    { path: '/streams', label: 'Streams', icon: LayoutDashboard },
    { path: '/logs', label: 'Logs', icon: FileText },
    { path: '/streams/trash', label: 'Trash', icon: Trash2 },
    { path: '/docs', label: 'Docs', icon: BookOpen },
  ].filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-200`}
      >
        <div className="h-28 flex items-center justify-between px-4 border-b border-zinc-800">
          {!collapsed && (
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-80 transition-opacity"
            >
              <img src={logoImg} alt="cloaka" className="h-16" />
            </button>
          )}
          <button
            onClick={toggleCollapsed}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {collapsed ? (
              <Menu className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-800 space-y-1">
          <Link
            to="/help"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/help'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Help</span>}
          </Link>
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/profile'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="text-sm text-zinc-400">
            {location.pathname === '/' && 'Dashboard'}
            {location.pathname === '/users' && 'Users'}
            {location.pathname === '/streams' && 'Streams'}
            {location.pathname.startsWith('/streams/') && 'Stream Details'}
            {location.pathname === '/logs' && 'Logs'}
            {location.pathname === '/profile' && 'Profile'}
            {location.pathname === '/docs' && 'Docs'}
            {location.pathname === '/help' && 'Help'}
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-zinc-400" />
              <div className="text-sm">
                <div className="text-zinc-200">{user?.email}</div>
                <div className="text-zinc-500 text-xs capitalize">{user?.role}</div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
