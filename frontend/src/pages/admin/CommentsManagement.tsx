import { useEffect, useState } from 'react';
import { useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Eye, Upload, MessageSquareText,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import SentimentBadge from '../../components/SentimentBadge';
import ConfidenceGauge from '../../components/ConfidenceGauge';
import { Spinner, ErrorState, EmptyState } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import {
  fetchComments, fetchConsultations, analyzeBatch, getApiErrorMessage,
} from '../../api/client';
import type { Comment, Consultation, BatchAnalyzeResult } from '../../types';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function CommentsManagement() {
  const { showToast } = useToast();
  const [data, setData] = useState<{ items: Comment[]; total: number; total_pages: number } | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [consultationId, setConsultationId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<Comment | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchAnalyzeResult | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchComments({
      page,
      page_size: pageSize,
      search: search || undefined,
      sentiment: sentiment || undefined,
      consultation_id: consultationId ? Number(consultationId) : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    })
      .then(setData)
      .catch(() => setError('Could not load comments.'))
      .finally(() => setLoading(false));
  }, [page, search, sentiment, consultationId, dateFrom, dateTo]);

  useEffect(() => {
    fetchConsultations().then(setConsultations).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, sentiment, consultationId, dateFrom, dateTo]);

  async function handleBatchUpload() {
    if (!batchFile) return;
    setBatchLoading(true);
    try {
      const result = await analyzeBatch(batchFile);
      setBatchResult(result);
      showToast(`Processed ${result.processed} of ${result.total_rows} comments.`);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setBatchLoading(false);
    }
  }

  function closeBatchModal() {
    setBatchOpen(false);
    setBatchFile(null);
    setBatchResult(null);
  }

  return (
    <div>
      <PageHeader
        title="Comments"
        description="Search, filter, and review every comment analyzed by the AI engine."
        action={
          <button
            onClick={() => setBatchOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800"
          >
            <Upload size={15} /> Batch upload CSV
          </button>
        }
      />

      <div className="p-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comment text…"
              className="w-full rounded-md border border-ink-200 bg-paper-0 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="rounded-md border border-ink-200 bg-paper-0 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
          >
            <option value="">All sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
            <option value="Neutral">Neutral</option>
          </select>
          <select
            value={consultationId}
            onChange={(e) => setConsultationId(e.target.value)}
            className="rounded-md border border-ink-200 bg-paper-0 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
          >
            <option value="">All consultations</option>
            {consultations.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-md border border-ink-200 bg-paper-0 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-md border border-ink-200 bg-paper-0 px-3 py-2.5 text-sm outline-none focus:border-teal-600"
          />
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="No comments found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-ink-100 bg-paper-0">
              <table className="w-full text-sm">
                <thead className="border-b border-ink-100 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Comment</th>
                    <th className="px-4 py-3 font-medium">Consultation</th>
                    <th className="px-4 py-3 font-medium">Sentiment</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((c) => (
                    <tr key={c.id} className="border-b border-ink-100 last:border-0 hover:bg-paper-50">
                      <td className="max-w-sm truncate px-4 py-3 text-ink-800">{c.comment_text}</td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-ink-500">{c.consultation_title}</td>
                      <td className="px-4 py-3">
                        {c.sentiment_result ? (
                          <SentimentBadge sentiment={c.sentiment_result.sentiment} confidence={c.sentiment_result.confidence} size="sm" />
                        ) : (
                          <span className="text-xs text-ink-400">Not analyzed</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-500">{formatDateTime(c.submitted_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(c)}
                          className="rounded-md p-1.5 text-ink-500 hover:bg-paper-100 hover:text-ink-900"
                          aria-label="View details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
              <span>
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.total)} of {data.total} comments
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-md border border-ink-200 px-2.5 py-1.5 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span className="font-mono-data">{page} / {data.total_pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="flex items-center gap-1 rounded-md border border-ink-200 px-2.5 py-1.5 disabled:opacity-40"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Comment detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Comment details" width="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Original comment</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-800">{selected.comment_text}</p>
            </div>

            {selected.sentiment_result ? (
              <div className="flex items-center gap-5 rounded-md bg-paper-50 p-4">
                <ConfidenceGauge
                  confidence={selected.sentiment_result.confidence}
                  sentiment={selected.sentiment_result.sentiment}
                  size={80}
                />
                <div>
                  <SentimentBadge sentiment={selected.sentiment_result.sentiment} />
                  <p className="mt-2 text-xs text-ink-500">
                    Analyzed {formatDateTime(selected.sentiment_result.analyzed_at)}
                  </p>
                  <p className="font-mono-data text-xs text-ink-400">
                    Model: {selected.sentiment_result.model_version}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-500">This comment has not been analyzed.</p>
            )}

            {selected.sentiment_result && (
              <>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Processed text</p>
                  <p className="mt-1 font-mono-data text-xs text-ink-600">{selected.sentiment_result.processed_text}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Keywords</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selected.sentiment_result.keywords.map((k) => (
                      <span key={k} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700">{k}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-ink-100 pt-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Consultation</p>
                <p className="mt-0.5 text-ink-700">{selected.consultation_title}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Submitted</p>
                <p className="mt-0.5 text-ink-700">{formatDateTime(selected.submitted_at)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Submitted by</p>
                <p className="mt-0.5 text-ink-700">{selected.submitter_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Status</p>
                <p className="mt-0.5 text-ink-700 capitalize">{selected.status}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Batch upload modal */}
      <Modal open={batchOpen} onClose={closeBatchModal} title="Batch analysis — upload CSV">
        {!batchResult ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">
              Upload a CSV with columns <code className="font-mono-data text-xs">comment</code>,{' '}
              <code className="font-mono-data text-xs">consultation</code>, and optionally{' '}
              <code className="font-mono-data text-xs">date</code>. New consultations will be created
              automatically if the title doesn't already exist.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setBatchFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-md file:border-0 file:bg-ink-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-ink-800"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={closeBatchModal} className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-100">
                Cancel
              </button>
              <button
                onClick={handleBatchUpload}
                disabled={!batchFile || batchLoading}
                className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60"
              >
                {batchLoading ? 'Processing…' : 'Upload & analyze'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md bg-paper-50 p-3">
                <p className="font-mono-data text-xl font-semibold text-ink-900">{batchResult.total_rows}</p>
                <p className="text-xs text-ink-500">Total rows</p>
              </div>
              <div className="rounded-md bg-[var(--color-positive-bg)] p-3">
                <p className="font-mono-data text-xl font-semibold text-[var(--color-positive)]">{batchResult.processed}</p>
                <p className="text-xs text-ink-500">Processed</p>
              </div>
              <div className="rounded-md bg-[var(--color-negative-bg)] p-3">
                <p className="font-mono-data text-xl font-semibold text-[var(--color-negative)]">{batchResult.failed}</p>
                <p className="text-xs text-ink-500">Failed</p>
              </div>
            </div>
            {batchResult.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-md bg-[var(--color-negative-bg)] p-3 text-xs text-[var(--color-negative)]">
                {batchResult.errors.map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={closeBatchModal} className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800">
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
