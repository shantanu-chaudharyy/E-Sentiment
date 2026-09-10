import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquareText,
  Sparkles,
  LineChart,
  FileBarChart2,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/consultations', label: 'Consultations', icon: FileText },
  { to: '/admin/comments', label: 'Comments', icon: MessageSquareText },
  { to: '/admin/ai-analysis', label: 'AI Analyzer', icon: Sparkles },
  { to: '/admin/insights', label: 'Insights', icon: LineChart },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-paper-50 font-sans">
      <aside className="flex w-64 shrink-0 flex-col border-r border-ink-950/20 bg-ink-900 text-paper-0 shadow-xl">
        <div className="flex items-center gap-3 border-b border-ink-800/60 px-6 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight tracking-tight text-white">
              E-Sentiment
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
              Admin Console
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md font-semibold'
                    : 'text-ink-200 hover:bg-ink-800/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-ink-300 group-hover:text-white'} />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-subtle" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-800/80 bg-ink-950/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700/50 font-bold text-teal-200 text-sm border border-teal-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'Administrator'}</p>
              <p className="truncate text-xs text-ink-300">{user?.email || 'admin@esentiment.local'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-ink-700/60 bg-ink-800/40 px-3 py-2 text-xs font-medium text-ink-200 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 shadow-sm"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
