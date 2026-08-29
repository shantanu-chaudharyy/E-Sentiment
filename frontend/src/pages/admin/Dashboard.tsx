import { useEffect, useState } from 'react';
import {
  MessagesSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Gauge,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { Spinner, ErrorState } from '../../components/States';
import {
  fetchDashboardStats, fetchTrends, fetchSentimentByConsultation, fetchKeywords,
} from '../../api/client';
import type { DashboardStats, TrendPoint, SentimentByConsultation, KeywordCount } from '../../types';

const SENTIMENT_COLORS = { Positive: '#16a34a', Negative: '#dc2626', Neutral: '#d97706' };

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [byConsultation, setByConsultation] = useState<SentimentByConsultation[]>([]);
  const [keywords, setKeywords] = useState<KeywordCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchDashboardStats(),
      fetchTrends(),
      fetchSentimentByConsultation(),
      fetchKeywords(10),
    ])
      .then(([s, t, b, k]) => {
        setStats(s);
        setTrends(t);
        setByConsultation(b);
        setKeywords(k);
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const pieData = stats
    ? [
        { name: 'Positive', value: stats.positive_count },
        { name: 'Negative', value: stats.negative_count },
        { name: 'Neutral', value: stats.neutral_count },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live sentiment overview across all consultations, computed from the database."
      />
      <div className="p-8">
        {loading ? (
          <Spinner label="Loading dashboard…" />
        ) : error || !stats ? (
          <ErrorState message={error || 'No data'} onRetry={load} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Total comments" value={stats.total_comments} icon={MessagesSquare} accent="#0e7c86" />
              <StatCard label="Positive" value={stats.positive_count} sublabel={`${stats.positive_pct}% of analyzed`} icon={ThumbsUp} accent="#16a34a" />
              <StatCard label="Negative" value={stats.negative_count} sublabel={`${stats.negative_pct}% of analyzed`} icon={ThumbsDown} accent="#dc2626" />
              <StatCard label="Neutral" value={stats.neutral_count} sublabel={`${stats.neutral_pct}% of analyzed`} icon={Minus} accent="#d97706" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Avg. AI confidence" value={`${stats.average_confidence}%`} icon={Gauge} accent="#0e7c86" />
              <StatCard label="Consultations" value={stats.total_consultations} icon={MessagesSquare} accent="#5b6b82" />
              <StatCard label="Active consultations" value={stats.active_consultations} icon={MessagesSquare} accent="#16a34a" />
              <div />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <ChartCard title="Sentiment distribution">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Sentiment over time">
                {trends.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e7ef" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.Positive} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.Negative} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.Neutral} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Sentiment by consultation">
                {byConsultation.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={byConsultation} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e7ef" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="consultation_title"
                        width={160}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string) => (v.length > 22 ? v.slice(0, 22) + '…' : v)}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.Positive} />
                      <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.Negative} />
                      <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.Neutral} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Top keywords">
                {keywords.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={keywords} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e1e7ef" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="keyword" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0e7c86" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-paper-0 p-5">
      <h3 className="mb-2 text-sm font-semibold text-ink-800">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-[260px] items-center justify-center text-sm text-ink-400">Not enough data yet</div>;
}
