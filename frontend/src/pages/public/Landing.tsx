import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  MessageSquarePlus,
  Cpu,
  BarChart3,
  FileCheck2,
} from 'lucide-react';
import { fetchDashboardStats, fetchConsultations } from '../../api/client';
import type { DashboardStats, Consultation } from '../../types';

const STEPS = [
  {
    n: '01',
    title: 'Citizens submit feedback',
    body: 'Anyone can read an open consultation and share their views in plain language — no forms, no jargon.',
    icon: MessageSquarePlus,
  },
  {
    n: '02',
    title: 'The AI engine reads every comment',
    body: 'Each submission is preprocessed and scored by a trained sentiment model the moment it arrives.',
    icon: Cpu,
  },
  {
    n: '03',
    title: 'Sentiment is classified with confidence',
    body: 'Comments are labelled Positive, Negative, or Neutral, with a transparent confidence score attached.',
    icon: BarChart3,
  },
  {
    n: '04',
    title: 'Analysts see the full picture',
    body: 'Officers track sentiment trends, keywords, and consultation health, then publish a summary report.',
    icon: FileCheck2,
  },
];

export default function Landing() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(() => {});
    fetchConsultations({ status: 'Active' }).then((data) => setConsultations(data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-ink-100 bg-paper-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center rounded-full border border-teal-600/30 bg-teal-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-teal-700">
              SIH25035 · e-Consultation sentiment analysis
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl">
              Every citizen comment,
              <br />
              read, scored, and understood.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-500">
              E-Sentiment gives the Ministry of Corporate Affairs a live read on how citizens and
              businesses feel about proposed policy — turning thousands of free-text comments into
              clear sentiment signals within seconds of submission.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/consultations"
                className="inline-flex items-center gap-2 rounded-md bg-ink-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-800"
              >
                Browse open consultations
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 rounded-md border border-ink-200 px-5 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-ink-900 hover:text-ink-900"
              >
                Admin sign in
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-ink-100 bg-paper-50 p-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-400">
              Live system snapshot
            </p>
            <div className="grid grid-cols-2 gap-4">
              <SnapshotStat label="Comments analyzed" value={stats?.total_comments ?? '—'} />
              <SnapshotStat label="Consultations open" value={stats?.active_consultations ?? '—'} />
              <SnapshotStat
                label="Positive sentiment"
                value={stats ? `${stats.positive_pct}%` : '—'}
                color="var(--color-positive)"
              />
              <SnapshotStat
                label="Avg. AI confidence"
                value={stats ? `${stats.average_confidence}%` : '—'}
                color="var(--color-teal-600)"
              />
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Figures are pulled live from the E-Sentiment database.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — this genuinely is a sequence, so numbering carries information */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-2xl font-semibold text-ink-900">How a comment becomes insight</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          The same pipeline runs for every comment submitted through the portal — no manual review step
          determines whether it gets analyzed.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, title, body, icon: Icon }) => (
            <div key={n} className="relative rounded-lg border border-ink-100 bg-paper-0 p-5">
              <span className="font-mono-data text-xs text-ink-300">{n}</span>
              <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-600">
                <Icon size={17} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open consultations preview */}
      <section className="border-t border-ink-100 bg-paper-0 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Open for feedback</h2>
            <Link to="/consultations" className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {consultations.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">No active consultations right now — check back soon.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {consultations.map((c) => (
                <Link
                  key={c.id}
                  to={`/consultations/${c.id}`}
                  className="rounded-lg border border-ink-100 bg-paper-50 p-5 transition-colors hover:border-teal-600/40 hover:bg-teal-50/40"
                >
                  <span className="inline-flex items-center rounded-full bg-[var(--color-positive-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-positive)]">
                    {c.status}
                  </span>
                  <h3 className="mt-3 font-medium text-ink-900">{c.title}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{c.description}</p>
                  <p className="mt-3 text-xs font-mono-data text-ink-400">{c.comment_count} comments so far</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SnapshotStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div>
      <p className="font-mono-data text-2xl font-semibold" style={{ color: color || 'var(--color-ink-900)' }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-ink-500">{label}</p>
    </div>
  );
}
