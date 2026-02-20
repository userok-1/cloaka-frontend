import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { LanguageSwitcher } from './LanguageSwitcher';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
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
      toast.success(t('auth.logoutSuccess'));
      navigate('/login');
    } catch {
      toast.error(t('auth.logoutFailed'));
    }
  };

  const navItems: { path: string; labelKey: string; icon: typeof Home; adminOnly?: boolean }[] = [
    { path: '/', labelKey: 'nav.home', icon: Home },
    { path: '/users', labelKey: 'nav.users', icon: Users, adminOnly: true },
    { path: '/streams', labelKey: 'nav.streams', icon: LayoutDashboard },
    { path: '/logs', labelKey: 'nav.logs', icon: FileText },
    { path: '/streams/trash', labelKey: 'nav.trash', icon: Trash2 },
    { path: '/docs', labelKey: 'nav.docs', icon: BookOpen },
  ].filter((item) => !item.adminOnly || user?.role === 'admin');

  const getPageTitle = () => {
    if (location.pathname === '/') return t('nav.dashboard');
    if (location.pathname === '/users') return t('nav.users');
    if (location.pathname === '/streams') return t('nav.streams');
    if (location.pathname.startsWith('/streams/')) return t('nav.streamDetails');
    if (location.pathname === '/logs') return t('nav.logs');
    if (location.pathname === '/profile') return t('nav.profile');
    if (location.pathname === '/docs') return t('nav.docs');
    if (location.pathname === '/help') return t('nav.help');
    return '';
  };

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
                {!collapsed && <span className="text-sm font-medium">{t(item.labelKey)}</span>}
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
            {!collapsed && <span className="text-sm font-medium">{t('nav.help')}</span>}
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
            {!collapsed && <span className="text-sm font-medium">{t('nav.settings')}</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="text-sm text-zinc-400">{getPageTitle()}</div>

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
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title={t('nav.logout')}
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
