import type { LucideIcon } from 'lucide-react';
import { Inbox, AlertTriangle, Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-ink-400">
      <Loader2 className="animate-spin" size={26} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 bg-paper-0 py-14 px-6 text-center">
      <Icon className="text-ink-300" size={30} />
      <h3 className="font-medium text-ink-800">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--color-negative-bg)] bg-[var(--color-negative-bg)] py-10 px-6 text-center">
      <AlertTriangle className="text-[var(--color-negative)]" size={26} />
      <p className="text-sm font-medium text-ink-800">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border border-ink-200 bg-paper-0 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-paper-100"
        >
          Try again
        </button>
      )}
    </div>
  );
}
