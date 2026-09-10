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
    <div className="animate-fade-in">
      <PageHeader
        title="AI Sentiment Analyzer"
        description="Run any custom text through the trained NLP model for instant sentiment scoring and keyword breakdown."
      />
      <div className="grid gap-6 p-8 lg:grid-cols-2">
        <div className="rounded-xl border border-ink-100 bg-paper-0 p-6 shadow-sm">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Sparkles size={16} className="text-teal-600 animate-pulse-subtle" /> Enter comment or feedback to analyze
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            maxLength={5000}
            placeholder="e.g. This policy will greatly help small businesses and make compliance easier."
            className="w-full resize-none rounded-xl border border-ink-200 bg-paper-50/50 p-3.5 text-sm leading-relaxed text-ink-900 outline-none transition-all focus:border-teal-600 focus:bg-paper-0 focus:ring-2 focus:ring-teal-100 shadow-inner"
          />
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Quick Test Samples</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setText(s)}
                  className="rounded-lg border border-ink-200 bg-paper-50 px-3 py-1.5 text-xs text-ink-700 font-medium transition-all hover:border-teal-600 hover:bg-teal-50 hover:text-teal-800"
                >
                  {s.length > 38 ? s.slice(0, 38) + '…' : s}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ink-900 to-teal-800 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-md"
          >
            <Wand2 size={16} />
            {loading ? 'Processing via AI Engine…' : 'Analyze Sentiment Now'}
          </button>
          {error && (
            <p className="mt-4 rounded-xl bg-[var(--color-negative-bg)] p-3.5 text-sm font-medium text-[var(--color-negative)] border border-negative/20">
              {error}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-ink-100 bg-paper-0 p-6 shadow-sm flex flex-col">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-500 border-b border-ink-100/80 pb-3">
            Analysis Results
          </h3>
          {!result && !loading && (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-sm text-ink-400">
              <Sparkles size={32} className="text-ink-300 mb-2 opacity-50" />
              <p className="font-medium">Enter text on the left to analyze sentiment.</p>
            </div>
          )}
          {loading && (
            <div className="flex flex-1 items-center justify-center py-16 text-sm font-medium text-teal-700 animate-pulse-subtle">
              Analyzing text with TF-IDF + Classifier…
            </div>
          )}
          {result && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-6 rounded-xl bg-paper-50/80 p-4 border border-ink-100/80">
                <ConfidenceGauge confidence={result.confidence} sentiment={result.sentiment} size={110} />
                <div>
                  <SentimentBadge sentiment={result.sentiment} />
                  <p className="mt-2.5 font-mono-data text-xs font-semibold text-ink-500">
                    Model: <span className="text-teal-700">{result.model_version}</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">Class Probabilities</p>
                <div className="space-y-2.5">
                  {Object.entries(result.probabilities).map(([label, prob]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-16 text-xs font-semibold text-ink-700">{label}</span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-200">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${prob * 100}%`, backgroundColor: PROB_COLORS[label] || '#5b6b82' }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono-data text-xs font-bold text-ink-700">
                        {(prob * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Processed Token Stream</p>
                <div className="mt-1.5 rounded-lg bg-paper-50 p-3 font-mono-data text-xs text-ink-700 border border-ink-100">
                  {result.processed_text || text}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Key Extracted Terms</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.map((k) => (
                    <span key={k} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 border border-teal-200/50">
                      #{k}
                    </span>
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
