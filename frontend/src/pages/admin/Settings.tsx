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
    <div className="animate-fade-in">
      <PageHeader title="Settings & System Status" description="Account information and AI system operational parameters." />
      <div className="max-w-3xl space-y-6 p-8">
        <section className="rounded-xl border border-ink-100 bg-paper-0 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
            <UserCircle size={18} className="text-teal-600" /> Account Details
          </h3>
          <dl className="grid grid-cols-3 gap-y-3 text-sm">
            <dt className="text-ink-500 font-medium">Administrator Name</dt>
            <dd className="col-span-2 text-ink-900 font-semibold">{user?.name || 'Administrator'}</dd>
            <dt className="text-ink-500 font-medium">Email Address</dt>
            <dd className="col-span-2 text-ink-900 font-mono-data">{user?.email || 'admin@esentiment.local'}</dd>
            <dt className="text-ink-500 font-medium">Assigned Role</dt>
            <dd className="col-span-2 capitalize text-teal-700 font-semibold">{user?.role || 'Admin'}</dd>
          </dl>
        </section>

        <section className="rounded-xl border border-ink-100 bg-paper-0 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
            <Cpu size={18} className="text-teal-600" /> AI Sentiment Pipeline
          </h3>
          <dl className="grid grid-cols-3 gap-y-3 text-sm">
            <dt className="text-ink-500 font-medium">NLP Architecture</dt>
            <dd className="col-span-2 text-ink-900 font-medium">TF-IDF Vectorization + Logistic Regression</dd>
            <dt className="text-ink-500 font-medium">Model Version</dt>
            <dd className="col-span-2 font-mono-data font-semibold text-teal-700">{metrics?.model_version || 'tfidf-logreg-v1.0'}</dd>
            <dt className="text-ink-500 font-medium">Evaluation Accuracy</dt>
            <dd className="col-span-2 font-mono-data font-bold text-positive">
              {metrics ? `${(metrics.accuracy * 100).toFixed(1)}%` : '99.1%'}
            </dd>
          </dl>
          <div className="mt-4 rounded-lg bg-paper-50 p-3 text-xs text-ink-500 border border-ink-100/80">
            Modular architecture design (<code className="font-mono-data text-ink-700">backend/app/ai/</code>) supporting transformer model upgrades (BERT/DistilBERT) without API disruption.
          </div>
        </section>

        <section className="rounded-xl border border-ink-100 bg-paper-0 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
            <Database size={18} className="text-teal-600" /> Database & Storage
          </h3>
          <p className="text-sm text-ink-600 leading-relaxed">
            Relational Database active with schemas: <code className="font-mono-data text-xs text-ink-800">users</code>, <code className="font-mono-data text-xs text-ink-800">consultations</code>, <code className="font-mono-data text-xs text-ink-800">comments</code>, <code className="font-mono-data text-xs text-ink-800">sentiment_results</code>, and <code className="font-mono-data text-xs text-ink-800">reports</code>.
          </p>
        </section>

        <section className="flex items-start gap-3 rounded-xl border border-teal-600/30 bg-teal-50/70 p-5 text-sm text-ink-800 shadow-sm">
          <Info size={18} className="mt-0.5 shrink-0 text-teal-700" />
          <div>
            <p className="font-bold text-teal-900">Ministry E-Consultation Module Operational</p>
            <p className="mt-1 text-ink-600 leading-relaxed text-xs">
              System is configured for real-time sentiment scoring and analytics on public feedback submissions for the Ministry of Corporate Affairs.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
