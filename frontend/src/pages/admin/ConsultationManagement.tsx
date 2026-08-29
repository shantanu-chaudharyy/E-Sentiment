import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileStack } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { Spinner, ErrorState, EmptyState } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import {
  fetchConsultations, createConsultation, updateConsultation, deleteConsultation, getApiErrorMessage,
} from '../../api/client';
import type { Consultation } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-[var(--color-positive-bg)] text-[var(--color-positive)]',
  Closed: 'bg-paper-100 text-ink-500',
  Draft: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)]',
};

const emptyForm = {
  title: '',
  description: '',
  department: 'Ministry of Corporate Affairs',
  start_date: '',
  end_date: '',
  status: 'Draft',
};

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : '';
}

export default function ConsultationManagement() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Consultation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Consultation | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchConsultations()
      .then(setItems)
      .catch(() => setError('Could not load consultations.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Consultation) {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description,
      department: c.department,
      start_date: toDateInput(c.start_date),
      end_date: toDateInput(c.end_date),
      status: c.status,
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: form.status as Consultation['status'],
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      };
      if (editing) {
        await updateConsultation(editing.id, payload);
        showToast('Consultation updated.');
      } else {
        await createConsultation(payload);
        showToast('Consultation created.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteConsultation(deleteTarget.id);
      showToast('Consultation deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  }

  return (
    <div>
      <PageHeader
        title="Consultation management"
        description="Create, publish, and manage e-consultation drafts."
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800"
          >
            <Plus size={15} /> New consultation
          </button>
        }
      />
      <div className="p-8">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileStack}
            title="No consultations yet"
            description="Create your first consultation to start collecting feedback."
            action={
              <button onClick={openCreate} className="mt-2 rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800">
                New consultation
              </button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-ink-100 bg-paper-0">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-paper-50 text-left text-xs uppercase tracking-wide text-ink-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Window</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Comments</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-ink-100 last:border-0 hover:bg-paper-50">
                    <td className="max-w-xs px-4 py-3 font-medium text-ink-900">{c.title}</td>
                    <td className="px-4 py-3 text-ink-500">{c.department}</td>
                    <td className="px-4 py-3 text-ink-500">
                      {toDateInput(c.start_date)} → {toDateInput(c.end_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-data text-ink-700">{c.comment_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-md p-1.5 text-ink-500 hover:bg-paper-100 hover:text-ink-900"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="rounded-md p-1.5 text-ink-500 hover:bg-[var(--color-negative-bg)] hover:text-[var(--color-negative)]"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit consultation' : 'New consultation'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full resize-none rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Start date</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">End date</label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create consultation'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete consultation" width="max-w-sm">
        <p className="text-sm text-ink-600">
          This will permanently delete <strong>{deleteTarget?.title}</strong> and all associated comments. This
          action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md bg-[var(--color-negative)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
