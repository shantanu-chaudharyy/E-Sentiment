import type { Sentiment } from '../types';

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  Positive: '#16a34a',
  Negative: '#dc2626',
  Neutral: '#d97706',
};

interface Props {
  confidence: number; // 0..1
  sentiment: Sentiment;
  size?: number;
}

export default function ConfidenceGauge({ confidence, sentiment, size = 96 }: Props) {
  const pct = Math.max(0, Math.min(1, confidence));
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // gauge covers 270 degrees
  const gapLength = circumference - arcLength;
  const dashOffset = arcLength * (1 - pct);
  const color = SENTIMENT_COLOR[sentiment];
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-paper-200)"
          strokeWidth={7}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeLinecap="round"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono-data font-semibold text-ink-900" style={{ fontSize: size * 0.24 }}>
          {Math.round(pct * 100)}%
        </span>
        <span className="text-[10px] uppercase tracking-wide text-ink-400 -mt-0.5">confidence</span>
      </div>
    </div>
  );
}
