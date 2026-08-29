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
    <div className="flex min-h-screen bg-paper-50">
      <aside className="flex w-60 shrink-0 flex-col bg-ink-900 text-paper-0">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600">
            <ShieldCheck size={17} />
          </span>
          <div>
            <p className="font-display text-base font-semibold leading-none">E-Sentiment</p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-300">Admin console</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-ink-200 hover:bg-ink-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-800 px-4 py-4">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-ink-300">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-md border border-ink-700 px-3 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:border-ink-500 hover:text-white"
          >
            <LogOut size={13} />
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
