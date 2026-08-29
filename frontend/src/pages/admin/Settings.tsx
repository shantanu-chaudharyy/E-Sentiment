import { useEffect, useState } from 'react';
import { UserCircle, Cpu, Database, Info } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { fetchModelMetrics } from '../../api/client';
import type { ModelMetrics } from '../../types';

export default function Settings() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

  useEffect(() => {
    fetchModelMetrics().then(setMetrics).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Settings" description="Account information and system configuration." />
      <div className="max-w-2xl space-y-6 p-8">
        <section className="rounded-lg border border-ink-100 bg-paper-0 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <UserCircle size={15} className="text-teal-600" /> Account
          </h3>
          <dl className="grid grid-cols-3 gap-y-2 text-sm">
            <dt className="text-ink-500">Name</dt>
            <dd className="col-span-2 text-ink-800">{user?.name}</dd>
            <dt className="text-ink-500">Email</dt>
            <dd className="col-span-2 text-ink-800">{user?.email}</dd>
            <dt className="text-ink-500">Role</dt>
            <dd className="col-span-2 capitalize text-ink-800">{user?.role}</dd>
          </dl>
        </section>

        <section className="rounded-lg border border-ink-100 bg-paper-0 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Cpu size={15} className="text-teal-600" /> AI engine
          </h3>
          <dl className="grid grid-cols-3 gap-y-2 text-sm">
            <dt className="text-ink-500">Algorithm</dt>
            <dd className="col-span-2 text-ink-800">TF-IDF + Logistic Regression</dd>
            <dt className="text-ink-500">Model version</dt>
            <dd className="col-span-2 font-mono-data text-ink-800">{metrics?.model_version || '—'}</dd>
            <dt className="text-ink-500">Accuracy</dt>
            <dd className="col-span-2 font-mono-data text-ink-800">
              {metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '—'}
            </dd>
          </dl>
          <p className="mt-3 text-xs text-ink-400">
            The AI layer is modular by design (see <code className="font-mono-data">backend/app/ai/</code>) so it
            can later be swapped for a BERT, DistilBERT, or other Hugging Face Transformers model without changing
            the API contract.
          </p>
        </section>

        <section className="rounded-lg border border-ink-100 bg-paper-0 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Database size={15} className="text-teal-600" /> Database
          </h3>
          <p className="text-sm text-ink-600">SQLite (prototype). Tables: users, consultations, comments, sentiment_results, reports.</p>
        </section>

        <section className="flex items-start gap-3 rounded-lg border border-teal-600/30 bg-teal-50 p-4 text-sm text-ink-700">
          <Info size={16} className="mt-0.5 shrink-0 text-teal-600" />
          <p>
            This is a hackathon prototype (SIH25035). Demonstration data is synthetically generated and does not
            represent real citizen feedback collected by the Ministry of Corporate Affairs.
          </p>
        </section>
      </div>
    </div>
  );
}
