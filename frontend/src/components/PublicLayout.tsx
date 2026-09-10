import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`relative text-sm font-medium transition-colors ${
          active ? 'text-teal-700 font-semibold' : 'text-ink-500 hover:text-ink-900'
        }`}
      >
        {label}
        {active && (
          <span className="absolute -bottom-4 left-0 right-0 h-0.5 rounded-full bg-teal-600 animate-fade-in" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper-50 font-sans">
      <div className="bg-ink-900 py-2 text-center text-xs tracking-wide text-ink-200 shadow-sm">
        <span className="font-semibold text-white">Government of India</span> &nbsp;·&nbsp; Ministry of Corporate Affairs &nbsp;·&nbsp; E-Consultation Module
      </div>
      <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-paper-0/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ink-900 to-teal-700 text-paper-0 shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck size={19} />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-ink-900 leading-tight">
                E-Sentiment
              </span>
              <span className="text-[10px] font-medium tracking-wider text-teal-700 uppercase -mt-0.5">
                Analytics Portal
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            {navLink('/', 'Home')}
            {navLink('/consultations', 'Consultations')}
          </nav>
          <Link
            to="/admin/login"
            className="flex items-center gap-2 rounded-lg border border-ink-200 bg-paper-0 px-3.5 py-1.5 text-sm font-medium text-ink-700 transition-all hover:border-ink-900 hover:bg-ink-900 hover:text-white shadow-sm"
          >
            <LayoutDashboard size={15} />
            Admin Portal
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-100 bg-paper-0">
        <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs sm:text-sm">
              <strong className="font-semibold text-ink-800">E-Sentiment</strong> — AI-Powered Sentiment & Feedback Analytics Platform for E-Consultations.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-positive animate-pulse-subtle"></span>
              <p className="font-mono-data text-xs text-ink-600 font-medium">System Operational &nbsp;·&nbsp; MCA NLP Engine v1.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
