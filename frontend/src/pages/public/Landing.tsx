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
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-100/80 bg-gradient-to-b from-paper-0 via-paper-50/50 to-paper-100/40 py-16 sm:py-24">
        <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -z-10 h-80 w-80 rounded-full bg-ink-900/5 blur-3xl" />
        
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-600/30 bg-teal-50/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-800 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse-subtle" />
              Ministry of Corporate Affairs &nbsp;·&nbsp; AI Analytics Platform
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.12] text-ink-950 sm:text-5xl lg:text-6xl tracking-tight">
              Every citizen comment, <br />
              <span className="gradient-text-teal">read, scored, and understood.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
              E-Sentiment delivers live public feedback analytics for the Ministry of Corporate Affairs — transforming thousands of citizen policy comments into transparent sentiment signals within seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/consultations"
                className="inline-flex items-center gap-2.5 rounded-lg bg-ink-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-ink-800 hover:shadow-lg hover:-translate-y-0.5"
              >
                Browse Open Consultations
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-paper-0/80 backdrop-blur px-5 py-3.5 text-sm font-semibold text-ink-800 transition-all hover:border-ink-900 hover:bg-paper-0 hover:shadow-md"
              >
                Admin Console
              </Link>
            </div>
          </div>

          <div className="glass-panel card-hover-effect rounded-2xl p-7 shadow-lg border border-ink-100">
            <div className="flex items-center justify-between border-b border-ink-100/80 pb-4 mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Live System Overview
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse-subtle" /> Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SnapshotStat label="Comments Analyzed" value={stats?.total_comments ?? '—'} />
              <SnapshotStat label="Active Consultations" value={stats?.active_consultations ?? '—'} />
              <SnapshotStat
                label="Positive Sentiment"
                value={stats ? `${stats.positive_pct}%` : '—'}
                color="var(--color-positive)"
              />
              <SnapshotStat
                label="Avg. Model Confidence"
                value={stats ? `${stats.average_confidence}%` : '—'}
                color="var(--color-teal-600)"
              />
            </div>
            <div className="mt-5 rounded-lg bg-paper-50/80 p-3 text-xs text-ink-500 border border-ink-100/60 flex items-center justify-between">
              <span>Connected to MCA Database</span>
              <span className="font-mono-data text-[11px] text-ink-400">Real-time NLP</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest text-teal-700 uppercase">Automated NLP Pipeline</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-950 sm:text-4xl">How a comment becomes insight</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            Every submission is cleaned, vectorized, and scored in real time without manual bottlenecking.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, title, body, icon: Icon }) => (
            <div key={n} className="card-hover-effect group relative rounded-xl border border-ink-100 bg-paper-0 p-6 shadow-sm hover:border-teal-500/30">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                  <Icon size={19} />
                </div>
                <span className="font-mono-data text-sm font-semibold text-ink-300">{n}</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-ink-900 group-hover:text-teal-700 transition-colors">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open consultations preview */}
      <section className="border-t border-ink-100 bg-paper-0 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold tracking-widest text-teal-700 uppercase">Public Participation</span>
              <h2 className="font-display text-2xl font-bold text-ink-950 sm:text-3xl">Open for Feedback</h2>
            </div>
            <Link to="/consultations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 transition-all hover:text-teal-900 hover:translate-x-0.5">
              View all consultations <ArrowRight size={15} />
            </Link>
          </div>
          {consultations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
              No active consultations right now — check back soon.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3">
              {consultations.map((c) => (
                <Link
                  key={c.id}
                  to={`/consultations/${c.id}`}
                  className="card-hover-effect group flex flex-col justify-between rounded-xl border border-ink-100 bg-paper-50 p-6 shadow-sm transition-all hover:border-teal-500/40 hover:bg-paper-0"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center rounded-full bg-[var(--color-positive-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-positive)]">
                        {c.status}
                      </span>
                      <span className="text-xs font-medium text-ink-400">{c.department}</span>
                    </div>
                    <h3 className="font-bold text-ink-900 text-base group-hover:text-teal-700 transition-colors">{c.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">{c.description}</p>
                  </div>
                  <div className="mt-5 border-t border-ink-100/80 pt-4 flex items-center justify-between text-xs font-mono-data text-ink-400">
                    <span>{c.comment_count} comments</span>
                    <span className="font-sans font-medium text-teal-700 group-hover:underline">Submit views →</span>
                  </div>
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
    <div className="rounded-xl bg-paper-50/90 p-4 border border-ink-100/80">
      <p className="font-mono-data text-2xl font-bold tracking-tight" style={{ color: color || 'var(--color-ink-950)' }}>
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-ink-500 leading-snug">{label}</p>
    </div>
  );
}
