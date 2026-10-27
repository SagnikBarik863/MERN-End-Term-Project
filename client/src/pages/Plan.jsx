import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CheckCircle2, Info } from 'lucide-react';
import { useSchedule } from '../lib/queries';
import { formatDay, formatDue, formatHours, typeLabel } from '../lib/format';
import ConflictList from '../components/ConflictList';
import { EmptyState, ErrorState, PageLoader } from '../components/ui';

const DEFAULT_DAYS = 14;

export default function Plan() {
  const { data, isPending, error, refetch } = useSchedule();
  const [showAll, setShowAll] = useState(false);

  if (isPending) return <PageLoader label="Building your plan…" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { days, conflicts, summary } = data;
  const visible = showAll ? days : days.slice(0, DEFAULT_DAYS);
  const hasWork = summary.remainingHours > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Study plan</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Each day's free hours go to the task with the nearest deadline first. If a task still doesn't fit, no
          ordering of your time could fit it, so it's flagged as a conflict.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-ink-500">Work remaining</p>
          <p className="num mt-1 text-2xl font-semibold text-ink-950 glow-cyan">{formatHours(summary.remainingHours)}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-ink-500">Study time until last deadline</p>
          <p className="num mt-1 text-2xl font-semibold text-ink-950 glow-cyan">{formatHours(summary.availableHours)}</p>
        </div>
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-ink-500">Status</p>
          <p className={`mt-1 flex items-center gap-2 text-lg font-semibold ${summary.feasible ? 'text-emerald-600' : 'text-rose-600'}`}>
            {summary.feasible ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            {summary.feasible ? 'Everything fits' : `${conflicts.filter((c) => c.severity === 'high').length} serious conflicts`}
          </p>
        </div>
      </div>

      {conflicts.length > 0 && (
        <section className="card">
          <h2 className="flex items-center gap-2 border-b border-ink-100 px-4 py-3 section-title">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Conflicts
          </h2>
          <ConflictList conflicts={conflicts} />
        </section>
      )}

      {!hasWork ? (
        <div className="card">
          <EmptyState icon={CalendarDays} title="Nothing to schedule">
            Add tasks with deadlines and estimates, and your study plan appears here.
          </EmptyState>
        </div>
      ) : (
        <section className="card">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <h2 className="section-title">Day by day</h2>
            <Link to="/settings" className="text-sm font-medium text-brand-600 hover:underline">
              Change study hours
            </Link>
          </div>
          <ul className="divide-y divide-ink-100">
            {visible.map((d, i) => {
              const pct = d.capacity ? Math.round((d.used / d.capacity) * 100) : 0;
              return (
                <li key={d.date} className="grid gap-3 px-4 py-3 sm:grid-cols-[150px_1fr]">
                  <div>
                    <p className="text-sm font-medium">{i === 0 ? 'Today' : formatDay(d.date)}</p>
                    <p className="num text-xs text-ink-500">
                      {d.capacity === 0 ? 'No study time' : `${formatHours(d.used)} of ${formatHours(d.capacity)} · ${pct}%`}
                    </p>
                  </div>
                  {d.blocks.length ? (
                    <div className="space-y-1.5">
                      {d.blocks.map((b) => (
                        <Link
                          key={b.taskId}
                          to={`/tasks/${b.taskId}`}
                          className="flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2 hover:border-brand-200 hover:bg-brand-50/40"
                        >
                          <span className="num w-12 shrink-0 text-sm font-semibold text-brand-700">{formatHours(b.hours)}</span>
                          <span className="min-w-0 flex-1 truncate text-sm">{b.title}</span>
                          <span className="hidden shrink-0 text-xs text-ink-500 sm:inline">
                            {[b.course, typeLabel(b.type)].filter(Boolean).join(' · ')} · due {formatDue(b.dueAt)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="self-center text-sm text-ink-400">{d.capacity === 0 ? 'Rest day' : 'Free'}</p>
                  )}
                </li>
              );
            })}
          </ul>
          {days.length > DEFAULT_DAYS && (
            <button className="w-full border-t border-ink-100 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-ink-50" onClick={() => setShowAll((s) => !s)}>
              {showAll ? 'Show fewer days' : `Show all ${days.length} days`}
            </button>
          )}
        </section>
      )}

      <p className="flex items-start gap-2 text-xs text-ink-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Study time counts between 08:00 and 23:00 in your timezone ({data.timezone}). On a deadline day only the hours
        before the deadline count.
      </p>
    </div>
  );
}
