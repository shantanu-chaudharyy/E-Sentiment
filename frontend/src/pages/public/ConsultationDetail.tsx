import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Building2, CheckCircle2, Send, ArrowLeft } from 'lucide-react';
import { fetchConsultation, submitComment, getApiErrorMessage } from '../../api/client';
import type { Consultation } from '../../types';
import { Spinner, ErrorState } from '../../components/States';
import SentimentBadge from '../../components/SentimentBadge';
import type { Sentiment } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-[var(--color-positive-bg)] text-[var(--color-positive)]',
  Closed: 'bg-paper-100 text-ink-500',
  Draft: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)]',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ConsultationDetail() {
  const { id } = useParams();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sentiment: Sentiment; confidence: number } | null>(null);

  function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchConsultation(Number(id))
      .then(setConsultation)
      .catch(() => setError('Consultation not found.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consultation || text.trim().length < 2) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { comment } = await submitComment({
        consultation_id: consultation.id,
        comment_text: text.trim(),
        submitter_name: name.trim() || 'Anonymous Citizen',
      });
      setResult(
        comment.sentiment_result
          ? { sentiment: comment.sentiment_result.sentiment, confidence: comment.sentiment_result.confidence }
          : null
      );
      setText('');
      setName('');
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="py-20"><Spinner label="Loading consultation…" /></div>;
  if (error || !consultation) return <div className="mx-auto max-w-3xl px-5 py-16"><ErrorState message={error || 'Not found'} /></div>;

  const canSubmit = consultation.status === 'Active';

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/consultations" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900">
        <ArrowLeft size={14} /> Back to consultations
      </Link>

      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[consultation.status]}`}>
        {consultation.status}
      </span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">{consultation.title}</h1>

      <div className="mt-4 flex flex-wrap gap-5 text-sm text-ink-500">
        <span className="flex items-center gap-1.5"><Building2 size={14} /> {consultation.department}</span>
        <span className="flex items-center gap-1.5">
          <Calendar size={14} /> {formatDate(consultation.start_date)} – {formatDate(consultation.end_date)}
        </span>
      </div>

      <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-700">{consultation.description}</p>

      <div className="mt-10 rounded-lg border border-ink-100 bg-paper-0 p-6">
        <h2 className="font-display text-xl font-semibold text-ink-900">Submit your feedback</h2>
        <p className="mt-1 text-sm text-ink-500">
          Your comment will be analyzed by our AI sentiment engine and included in the ministry's
          consultation report.
        </p>

        {!canSubmit ? (
          <p className="mt-5 rounded-md bg-paper-100 px-4 py-3 text-sm text-ink-500">
            This consultation is {consultation.status.toLowerCase()} and is no longer accepting new feedback.
          </p>
        ) : result ? (
          <div className="mt-5 rounded-md border border-[var(--color-positive)]/30 bg-[var(--color-positive-bg)] p-5">
            <div className="flex items-center gap-2 text-[var(--color-positive)]">
              <CheckCircle2 size={18} />
              <p className="font-medium">Thank you — your feedback has been submitted.</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-ink-700">
              <span>Our AI engine classified your comment as</span>
              <SentimentBadge sentiment={result.sentiment} confidence={result.confidence} />
            </div>
            <button
              onClick={() => setResult(null)}
              className="mt-4 text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              Submit another comment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Your name (optional)</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous Citizen"
                className="w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Your comment</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                minLength={2}
                maxLength={5000}
                rows={5}
                placeholder="Share your thoughts on this consultation…"
                className="w-full resize-none rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <p className="mt-1 text-right text-xs text-ink-400">{text.length}/5000</p>
            </div>
            {submitError && (
              <p className="rounded-md bg-[var(--color-negative-bg)] px-3 py-2 text-sm text-[var(--color-negative)]">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting || text.trim().length < 2}
              className="flex items-center gap-2 rounded-md bg-ink-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} />
              {submitting ? 'Submitting…' : 'Submit feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
