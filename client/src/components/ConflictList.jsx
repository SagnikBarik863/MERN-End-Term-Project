import { Link } from 'react-router-dom';
import { AlertOctagon, CalendarX2, Layers, SunMoon } from 'lucide-react';

const ICON = {
  overdue: { icon: CalendarX2, tone: 'text-red-600 bg-red-50' },
  infeasible: { icon: AlertOctagon, tone: 'text-rose-600 bg-rose-50' },
  deadline_cluster: { icon: Layers, tone: 'text-amber-600 bg-amber-50' },
  no_availability: { icon: SunMoon, tone: 'text-ink-600 bg-ink-100' },
};

export default function ConflictList({ conflicts }) {
  return (
    <ul className="divide-y divide-ink-100">
      {conflicts.map((c) => {
        const { icon: Icon, tone } = ICON[c.type] ?? ICON.infeasible;
        const link = c.type === 'no_availability' ? '/settings' : c.taskIds.length === 1 ? `/tasks/${c.taskIds[0]}` : null;
        return (
          <li key={`${c.type}-${c.taskIds.join(',')}-${c.date ?? ''}`} className="flex gap-3 px-4 py-3">
            <span className={`h-fit rounded-md p-1.5 ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="text-ink-800">{c.message}</p>
              <p className="mt-0.5 text-xs text-ink-500">
                {c.suggestion}{' '}
                {link && (
                  <Link to={link} className="font-medium text-brand-600 hover:underline">
                    {c.type === 'no_availability' ? 'Open settings' : 'View task'}
                  </Link>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
