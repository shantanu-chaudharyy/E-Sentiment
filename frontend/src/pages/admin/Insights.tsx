import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
  LineChart, Line, Legend,
} from 'recharts';
import { Gauge, Target, Activity, Layers } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Spinner, ErrorState } from '../../components/States';
import {
  fetchKeywords, fetchTrends, fetchModelMetrics, fetchSentimentByConsultation,
} from '../../api/client';
import type { KeywordCount, TrendPoint, ModelMetrics, SentimentByConsultation } from '../../types';

export default function Insights() {
  const [keywords, setKeywords] = useState<KeywordCount[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [byConsultation, setByConsultation] = useState<SentimentByConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchKeywords(20),
      fetchTrends(),
      fetchModelMetrics().catch(() => null),
      fetchSentimentByConsultation(),
    ])
      .then(([k, t, m, b]) => {
        setKeywords(k);
        setTrends(t);
        setMetrics(m);
        setByConsultation(b);
      })
      .catch(() => setError('Could not load insights.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const mostDiscussed = [...byConsultation].sort((a, b) => b.total - a.total)[0];

  return (
    <div>
      <PageHeader title="Insights" description="Deeper analytics on sentiment trends, keywords, and model performance." />
      <div className="p-8">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <div className="space-y-6">
            {metrics && (
              <div className="rounded-lg border border-ink-100 bg-paper-0 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-800">
                  <Gauge size={15} className="text-teal-600" /> Model evaluation ({metrics.model_version})
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricTile icon={Target} label="Accuracy" value={metrics.accuracy} />
                  <MetricTile icon={Layers} label="Precision" value={metrics.precision} />
                  <MetricTile icon={Activity} label="Recall" value={metrics.recall} />
                  <MetricTile icon={Gauge} label="F1 Score" value={metrics.f1_score} />
                </div>
                <p className="mt-4 text-xs text-ink-400">
                  Computed on a held-out test split of {metrics.test_size} samples (trained on {metrics.train_size}).
                  These figures reflect performance on the synthetic demonstration dataset, not real citizen feedback.
                </p>
              </div>
            )}

            {mostDiscussed && (
              <div className="rounded-lg border border-teal-600/30 bg-teal-50 p-5">
                <p className="text-sm text-ink-700">
                  <strong>{mostDiscussed.consultation_title}</strong> is the most discussed consultation with{' '}
                  <span className="font-mono-data">{mostDiscussed.total}</span> analyzed comments —{' '}
                  <span className="font-mono-data text-[var(--color-positive)]">{mostDiscussed.positive}</span> positive,{' '}
                  <span className="font-mono-data text-[var(--color-negative)]">{mostDiscussed.negative}</span> negative,{' '}
                  <span className="font-mono-data text-[var(--color-neutral)]">{mostDiscussed.neutral}</span> neutral.
                </p>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-ink-100 bg-paper-0 p-5">
                <h3 className="mb-2 text-sm font-semibold text-ink-800">Top keywords across all comments</h3>
                {keywords.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-ink-400">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={keywords} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e7ef" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="keyword" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0e7c86" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="rounded-lg border border-ink-100 bg-paper-0 p-5">
                <h3 className="mb-2 text-sm font-semibold text-ink-800">Sentiment trend</h3>
                {trends.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-ink-400">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={340}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e7ef" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke="#16a34a" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="negative" stroke="#dc2626" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="neutral" stroke="#d97706" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricTile({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: number }) {
  return (
    <div className="rounded-md bg-paper-50 p-4">
      <div className="flex items-center gap-1.5 text-ink-500">
        <Icon size={13} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-mono-data mt-1.5 text-2xl font-semibold text-ink-900">{(value * 100).toFixed(1)}%</p>
    </div>
  );
}
