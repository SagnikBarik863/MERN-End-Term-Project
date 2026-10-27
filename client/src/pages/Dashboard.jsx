import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Plus, Sparkles, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRefreshPlan, useSchedule, useStats } from '../lib/queries';
import { post } from '../lib/api';
import { formatDay, formatHours, typeLabel } from '../lib/format';
import TaskRow from '../components/TaskRow';
import TaskFormModal from '../components/TaskFormModal';
import ProgressModal from '../components/ProgressModal';
import ConflictList from '../components/ConflictList';
import { EmptyState, ErrorState, PageLoader } from '../components/ui';

function Stat({ label, value, tone = 'text-ink-950 glow-cyan', hint }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className={`num mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const schedule = useSchedule();
  const stats = useStats();
  const [adding, setAdding] = useState(false);
  const [logging, setLogging] = useState(null);
  const refreshPlan = useRefreshPlan();
  const loadSample = useMutation({
    mutationFn: () => post('/tasks/sample'),
    onSuccess: (data) => {
      refreshPlan();
      toast.success(`Added ${data.created} sample tasks`);
    },
    onError: (err) => toast.error(err.message),
  });

  if (schedule.isPending) return <PageLoader label="Building your plan…" />;
  if (schedule.error) return <ErrorState error={schedule.error} onRetry={schedule.refetch} />;

  const { focus, days, conflicts, summary } = schedule.data;
  const today = days[0];
  const upcoming = days.slice(1, 4).filter((d) => d.blocks.length);
  const t = stats.data?.totals;
  const risky = stats.data ? stats.data.risk.critical + stats.data.risk.overdue : 0;
  const hasTasks = focus.length > 0 || conflicts.some((c) => c.type === 'overdue');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">
            {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {hasTasks
              ? summary.feasible
                ? `All ${formatHours(summary.remainingHours)} of remaining work fits before its deadlines.`
                : 'Some deadlines need attention. See the conflicts below.'
              : 'Add your first deadline to get a plan.'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add deadline
        </button>
      </div>

      {t && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Open tasks" value={t.open} hint={`${t.done} completed`} />
          <Stat label="Due in 7 days" value={t.dueThisWeek} />
          <Stat label="Hours of work left" value={formatHours(t.remainingHours)} />
          <Stat
            label="Need attention"
            value={risky}
            tone={risky ? 'text-rose-600' : 'text-emerald-600'}
            hint={risky ? 'Overdue or short on time' : 'Everything on track'}
          />
        </div>
      )}

      {!hasTasks ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title="Nothing on your plate yet"
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <button className="btn-primary" onClick={() => setAdding(true)}>
                  <Plus className="h-4 w-4" /> Add your first deadline
                </button>
                <button className="btn-secondary" onClick={() => loadSample.mutate()} disabled={loadSample.isPending}>
                  <Sparkles className="h-4 w-4" /> Try with a sample semester
                </button>
              </div>
            }
          >
            Add an assignment, exam or project with its deadline and a rough estimate. DeadlineOS will rank it and
            schedule study time for it.
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="min-w-0 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <h2 className="flex items-center gap-2 section-title">
                  <Target className="h-4 w-4 text-brand-600" /> Focus on these first
                </h2>
                <Link to="/tasks" className="text-sm font-medium text-brand-600 hover:underline">
                  All tasks
                </Link>
              </div>
              {focus.length ? (
                <ul className="divide-y divide-ink-100">
                  {focus.map((task) => (
                    <TaskRow key={task.id} task={task} onLogProgress={setLogging} />
                  ))}
                </ul>
              ) : (
                <p className="p-6 text-sm text-ink-500">No upcoming work. Only overdue items are left.</p>
              )}
            </div>

            {conflicts.length > 0 && (
              <div className="card">
                <h2 className="flex items-center gap-2 border-b border-ink-100 px-4 py-3 section-title">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Conflicts ({conflicts.length})
                </h2>
                <ConflictList conflicts={conflicts.slice(0, 4)} />
                {conflicts.length > 4 && (
                  <Link to="/plan" className="block border-t border-ink-100 px-4 py-2.5 text-sm font-medium text-brand-600 hover:underline">
                    See all {conflicts.length} conflicts
                  </Link>
                )}
              </div>
            )}
          </section>

          <section className="card h-fit min-w-0">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <h2 className="flex items-center gap-2 section-title">
                <CalendarClock className="h-4 w-4 text-brand-600" /> Today's study plan
              </h2>
              {today && (
                <span className="num text-xs text-ink-500">
                  {formatHours(today.used)} / {formatHours(today.capacity)}
                </span>
              )}
            </div>
            {today?.blocks.length ? (
              <ul className="space-y-2 p-4">
                {today.blocks.map((b) => (
                  <li key={b.taskId} className="flex items-center gap-3 rounded-lg bg-brand-50/60 px-3 py-2.5">
                    <span className="num w-12 shrink-0 text-sm font-semibold text-brand-700">{formatHours(b.hours)}</span>
                    <Link to={`/tasks/${b.taskId}`} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium hover:text-brand-700">{b.title}</span>
                      <span className="text-xs text-ink-500">
                        {[b.course, typeLabel(b.type)].filter(Boolean).join(' · ')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 p-4 text-sm text-ink-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {today?.capacity === 0 ? 'No study time is planned for the rest of today.' : 'Nothing scheduled for today.'}
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="border-t border-ink-100 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Coming up</p>
                <ul className="space-y-2">
                  {upcoming.map((d) => (
                    <li key={d.date} className="text-sm">
                      <span className="font-medium">{formatDay(d.date)}</span>
                      <span className="text-ink-500">
                        {' '}
                        · {d.blocks.map((b) => `${b.title} (${formatHours(b.hours)})`).join(', ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link to="/plan" className="flex items-center gap-1 border-t border-ink-100 px-4 py-2.5 text-sm font-medium text-brand-600 hover:underline">
              Full study plan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </div>
      )}

      <TaskFormModal open={adding} onClose={() => setAdding(false)} />
      <ProgressModal open={!!logging} task={logging} onClose={() => setLogging(null)} />
    </div>
  );
}
