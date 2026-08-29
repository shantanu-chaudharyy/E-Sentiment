import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors ${
          active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <div className="bg-ink-900 py-1.5 text-center text-xs text-ink-200">
        Government of India &nbsp;·&nbsp; Ministry of Corporate Affairs &nbsp;·&nbsp; E-Consultation Module
      </div>
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper-0/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-paper-0">
              <ShieldCheck size={17} />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
              E-Sentiment
            </span>
          </Link>
          <nav className="hidden items-center gap-7 sm:flex">
            {navLink('/', 'Home')}
            {navLink('/consultations', 'Consultations')}
          </nav>
          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900"
          >
            <LayoutDashboard size={15} />
            Admin
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-100 bg-paper-0">
        <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              E-Sentiment — AI-Powered Sentiment Analysis for E-Consultation Comments. Built for SIH25035.
            </p>
            <p className="font-mono-data text-xs text-ink-400">Prototype build · Not for production use</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
