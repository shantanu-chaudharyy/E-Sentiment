import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-lg border border-ink-100 bg-paper-0 p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: accent ? `${accent}1a` : 'var(--color-paper-100)', color: accent || 'var(--color-ink-600)' }}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="font-mono-data mt-3 text-3xl font-semibold text-ink-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-ink-400">{sublabel}</p>}
    </div>
  );
}
