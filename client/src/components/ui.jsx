import { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, RefreshCw, X } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-ink-400 ${className}`} aria-hidden />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-sm text-ink-500" role="status">
      <Spinner /> {label}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = "Couldn't load this" }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center" role="alert">
      <AlertTriangle className="h-8 w-8 text-amber-400 drop-shadow-[0_0_10px_#fbbf24]" />
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        <p className="mt-1 text-sm text-ink-500">{error?.message || 'Something went wrong.'}</p>
      </div>
      {onRetry && (
        <button className="btn-secondary" onClick={() => onRetry()}>
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {Icon && (
        <div className="rounded-full bg-brand-50 p-3 ring-1 ring-brand-400/40 shadow-glow">
          <Icon className="h-6 w-6 text-brand-600" />
        </div>
      )}
      <div>
        <p className="font-semibold text-ink-900">{title}</p>
        {children && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">{children}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  const dialogRef = useRef(null);
  // Kept in a ref so re-renders with a new onClose don't re-run the effect and steal focus.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('input, select, textarea, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:py-12">
      <div className="fixed inset-0" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card relative w-full ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
      >
        <div className="neon-divider absolute inset-x-6 top-0 h-px" aria-hidden />
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em]">{title}</h2>
          <button className="btn-ghost -mr-2 p-1.5" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>
      )}
    </div>
  );
}

const RISK = {
  overdue: { label: 'Overdue', cls: 'bg-red-50/70 text-red-700 ring-red-600/50 shadow-[0_0_12px_-4px_#f87171]' },
  critical: { label: 'Critical', cls: 'bg-rose-50/70 text-rose-700 ring-rose-600/50 shadow-[0_0_12px_-4px_#fb7185]' },
  at_risk: { label: 'At risk', cls: 'bg-amber-50/70 text-amber-700 ring-amber-600/50 shadow-[0_0_12px_-4px_#fbbf24]' },
  on_track: { label: 'On track', cls: 'bg-emerald-50/70 text-emerald-700 ring-emerald-600/40' },
  done: { label: 'Done', cls: 'bg-ink-100 text-ink-500 ring-ink-300' },
};

export function RiskBadge({ risk }) {
  const r = RISK[risk] ?? RISK.on_track;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${r.cls}`}>
      {r.label}
    </span>
  );
}

const GLOW = 'shadow-[0_0_14px_-5px_currentColor] [text-shadow:0_0_8px_currentColor]';

const SCORE_TONE = (score, risk) => {
  if (risk === 'done') return 'text-ink-400 bg-ink-100 ring-ink-300';
  if (risk === 'overdue' || risk === 'critical' || score >= 75) return `text-rose-700 bg-rose-50/60 ring-rose-600/60 ${GLOW}`;
  if (risk === 'at_risk' || score >= 50) return `text-amber-700 bg-amber-50/60 ring-amber-600/60 ${GLOW}`;
  return `text-brand-600 bg-brand-50 ring-brand-400/50 ${GLOW}`;
};

export function ScoreChip({ score, risk }) {
  return (
    <span
      className={`num inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ring-1 ring-inset ${SCORE_TONE(score, risk)}`}
      title="Priority score (0–100)"
    >
      {risk === 'done' ? '✓' : score}
    </span>
  );
}

export function ProgressBar({ value, max, tone = 'bar-neon' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
