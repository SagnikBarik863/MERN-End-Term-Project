import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, CalendarDays, LayoutDashboard, ListChecks, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NAV = [
  { to: '/', label: 'Today', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/plan', label: 'Study plan', icon: CalendarDays },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Logo({ dark = false }) {
  return (
    <span className="flex items-center gap-2.5 font-display text-[15px] font-bold tracking-[0.08em] text-ink-950">
      <img src="/favicon.svg" alt="" className={`h-8 w-8 ${dark ? '' : 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]'}`} />
      <span>
        DEADLINE<span className="text-neon">OS</span>
      </span>
    </span>
  );
}

const linkCls = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-50/80 text-brand-600 glow-cyan shadow-[inset_2px_0_0_#00f0ff,0_0_18px_-8px_rgba(0,240,255,0.8)]'
      : 'text-ink-600 hover:bg-brand-50/40 hover:text-ink-900'
  }`;

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-brand-300/15 bg-surface/60 px-3 py-5 backdrop-blur-md lg:flex lg:sticky lg:top-0 lg:h-screen">
        <div className="px-3">
          <Logo />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkCls}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 px-3 pt-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-ink-500">{user?.email}</p>
          <button className="btn-ghost -ml-3 mt-2 w-full justify-start" onClick={() => logout.mutate()}>
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-brand-300/15 bg-surface/60 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="lg:hidden">
              <Logo />
            </div>
            <p className="num hidden text-xs uppercase tracking-[0.2em] text-ink-500 lg:block">
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-neon-lime shadow-[0_0_8px_#b6ff3b]" />
              {new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
            </p>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <button className="btn-ghost p-2 lg:hidden" onClick={() => logout.mutate()} aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={(s) => `${linkCls(s)} shrink-0 py-1.5`}>
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
