import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Sentiment } from '../types';

const CONFIG: Record<Sentiment, { bg: string; text: string; Icon: typeof TrendingUp }> = {
  Positive: { bg: 'bg-[var(--color-positive-bg)]', text: 'text-[var(--color-positive)]', Icon: TrendingUp },
  Negative: { bg: 'bg-[var(--color-negative-bg)]', text: 'text-[var(--color-negative)]', Icon: TrendingDown },
  Neutral: { bg: 'bg-[var(--color-neutral-bg)]', text: 'text-[var(--color-neutral)]', Icon: Minus },
};

export default function SentimentBadge({
  sentiment,
  confidence,
  size = 'md',
}: {
  sentiment: Sentiment;
  confidence?: number;
  size?: 'sm' | 'md';
}) {
  const { bg, text, Icon } = CONFIG[sentiment];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${bg} ${text} ${padding}`}>
      <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2.5} />
      {sentiment}
      {typeof confidence === 'number' && (
        <span className="font-mono-data opacity-80">· {Math.round(confidence * 100)}%</span>
      )}
    </span>
  );
}
