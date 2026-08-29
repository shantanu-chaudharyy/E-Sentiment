import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ConfidenceGauge from '../../components/ConfidenceGauge';
import SentimentBadge from '../../components/SentimentBadge';
import { analyzeText, getApiErrorMessage } from '../../api/client';
import type { AnalyzeResponse } from '../../types';

const SAMPLES = [
  'This policy will make compliance easier for small businesses.',
  'The proposed process is too complicated and expensive.',
  'Please clarify which documents are required.',
];

const PROB_COLORS: Record<string, string> = {
  Positive: '#16a34a',
  Negative: '#dc2626',
  Neutral: '#d97706',
};

export default function AIAnalyzer() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeText(text.trim());
      setResult(res);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Sentiment Analyzer"
        description="Run any piece of text through the trained TF-IDF + Logistic Regression model."
      />
      <div className="grid gap-6 p-8 lg:grid-cols-2">
        <div className="rounded-lg border border-ink-100 bg-paper-0 p-6">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-700">
            <Sparkles size={15} className="text-teal-600" /> Enter text to analyze
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            maxLength={5000}
            placeholder="e.g. This policy will greatly help small businesses and make compliance easier."
            className="w-full resize-none rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s}
                onClick={() => setText(s)}
                className="rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-600 hover:border-teal-600 hover:text-teal-700"
              >
                {s.length > 38 ? s.slice(0, 38) + '…' : s}
              </button>
            ))}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="mt-5 flex items-center gap-2 rounded-md bg-ink-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 size={15} />
            {loading ? 'Analyzing…' : 'Analyze sentiment'}
          </button>
          {error && (
            <p className="mt-3 rounded-md bg-[var(--color-negative-bg)] px-3 py-2 text-sm text-[var(--color-negative)]">
              {error}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-ink-100 bg-paper-0 p-6">
          <h3 className="mb-4 text-sm font-medium text-ink-700">Result</h3>
          {!result && !loading && (
            <div className="flex h-64 items-center justify-center text-sm text-ink-400">
              Run an analysis to see results here.
            </div>
          )}
          {loading && (
            <div className="flex h-64 items-center justify-center text-sm text-ink-400">Analyzing…</div>
          )}
          {result && (
            <div className="animate-fade-in space-y-5">
              <div className="flex items-center gap-5">
                <ConfidenceGauge confidence={result.confidence} sentiment={result.sentiment} size={110} />
                <div>
                  <SentimentBadge sentiment={result.sentiment} />
                  <p className="mt-2 font-mono-data text-xs text-ink-400">Model: {result.model_version}</p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">Class probabilities</p>
                <div className="space-y-1.5">
                  {Object.entries(result.probabilities).map(([label, prob]) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-16 text-xs text-ink-600">{label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${prob * 100}%`, backgroundColor: PROB_COLORS[label] || '#5b6b82' }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono-data text-xs text-ink-500">{Math.round(prob * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Processed text</p>
                <p className="mt-1 font-mono-data text-xs text-ink-600">{result.processed_text}</p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Keywords</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {result.keywords.map((k) => (
                    <span key={k} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
