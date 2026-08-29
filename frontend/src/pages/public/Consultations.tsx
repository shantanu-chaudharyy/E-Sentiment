import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, FileStack } from 'lucide-react';
import { fetchConsultations } from '../../api/client';
import type { Consultation } from '../../types';
import { Spinner, EmptyState, ErrorState } from '../../components/States';

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-[var(--color-positive-bg)] text-[var(--color-positive)]',
  Closed: 'bg-paper-100 text-ink-500',
  Draft: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)]',
};

export default function Consultations() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchConsultations({ status: status || undefined, search: search || undefined })
      .then(setItems)
      .catch(() => setError('Could not load consultations. Please try again.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Consultations</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          Browse policies and drafts published by the Ministry of Corporate Affairs and share your
          feedback on any consultation that is currently active.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search consultations…"
            className="w-full rounded-md border border-ink-200 bg-paper-0 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-ink-200 bg-paper-0 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading consultations…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileStack}
          title="No consultations found"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((c) => (
            <Link
              key={c.id}
              to={`/consultations/${c.id}`}
              className="group rounded-lg border border-ink-100 bg-paper-0 p-5 transition-colors hover:border-teal-600/40"
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status]}`}>
                  {c.status}
                </span>
                <span className="text-xs text-ink-400">{c.department}</span>
              </div>
              <h3 className="mt-3 font-medium text-ink-900 group-hover:text-teal-700">{c.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{c.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
                <span className="font-mono-data">{c.comment_count} comments</span>
                <span className="flex items-center gap-1 font-medium text-teal-700">
                  View details <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
