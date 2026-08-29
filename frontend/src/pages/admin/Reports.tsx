import { useEffect, useState } from 'react';
import { FileBarChart2, Download, FileDown } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Spinner, ErrorState, EmptyState } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import {
  fetchReports, fetchConsultations, generateReport, downloadCsvExport, getApiErrorMessage,
} from '../../api/client';
import type { ReportOut, Consultation } from '../../types';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Reports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([fetchReports(), fetchConsultations()])
      .then(([r, c]) => {
        setReports(r);
        setConsultations(c);
      })
      .catch(() => setError('Could not load reports.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateReport(selectedConsultation ? Number(selectedConsultation) : undefined);
      showToast('Report generated successfully.');
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setGenerating(false);
    }
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      await downloadCsvExport(selectedConsultation ? Number(selectedConsultation) : undefined);
      showToast('CSV export downloaded.');
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setExporting(false);
    }
  }

  function consultationTitle(id: number | null) {
    if (!id) return 'Overall (all consultations)';
    return consultations.find((c) => c.id === id)?.title || `Consultation #${id}`;
  }

  return (
    <div>
      <PageHeader title="Reports" description="Generate consultation sentiment reports and export raw data." />
      <div className="p-8">
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-ink-100 bg-paper-0 p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Scope</label>
            <select
              value={selectedConsultation}
              onChange={(e) => setSelectedConsultation(e.target.value)}
              className="w-full rounded-md border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Overall (all consultations)</option>
              {consultations.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-md bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60"
          >
            <FileBarChart2 size={15} /> {generating ? 'Generating…' : 'Generate report'}
          </button>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-paper-100 disabled:opacity-60"
          >
            <FileDown size={15} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : reports.length === 0 ? (
          <EmptyState icon={FileBarChart2} title="No reports generated yet" description="Generate your first sentiment report above." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-ink-100 bg-paper-0">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Scope</th>
                  <th className="px-4 py-3 font-medium">Generated</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Positive</th>
                  <th className="px-4 py-3 font-medium">Negative</th>
                  <th className="px-4 py-3 font-medium">Neutral</th>
                  <th className="px-4 py-3 font-medium text-right">File</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-ink-100 last:border-0 hover:bg-paper-50">
                    <td className="px-4 py-3 font-medium text-ink-900">{consultationTitle(r.consultation_id)}</td>
                    <td className="px-4 py-3 text-ink-500">{formatDateTime(r.generated_at)}</td>
                    <td className="px-4 py-3 font-mono-data text-ink-700">{r.total_comments}</td>
                    <td className="px-4 py-3 font-mono-data text-[var(--color-positive)]">{r.positive_count}</td>
                    <td className="px-4 py-3 font-mono-data text-[var(--color-negative)]">{r.negative_count}</td>
                    <td className="px-4 py-3 font-mono-data text-[var(--color-neutral)]">{r.neutral_count}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                        <Download size={12} /> {r.file_path.split('/').pop()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
