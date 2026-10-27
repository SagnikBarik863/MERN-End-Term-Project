import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlarmClock, CalendarDays, Gauge, LineChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { browserTimezone } from '../lib/format';
import { Logo } from '../components/Layout';
import { Field, Spinner } from '../components/ui';

const POINTS = [
  { icon: Gauge, title: 'Know what to do first', text: 'Every task gets a priority score from its deadline, effort, difficulty and your free time.' },
  { icon: CalendarDays, title: 'A plan that fits your week', text: 'Study hours are allocated day by day, earliest deadline first, within the hours you have.' },
  { icon: AlarmClock, title: 'Catch problems early', text: "See conflicts before they happen, and get alerted when work falls behind or a deadline gets close." },
  { icon: LineChart, title: 'Learn how you work', text: 'Track hours, on-time rate and how far off your estimates usually are.' },
];

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const mutation = isLogin ? login : register;

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined, _form: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const local = {};
    if (!isLogin && !form.name.trim()) local.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) local.email = 'Enter a valid email address';
    if (!isLogin && form.password.length < 8) local.password = 'Use at least 8 characters';
    if (isLogin && !form.password) local.password = 'Enter your password';
    if (Object.keys(local).length) return setErrors(local);

    const body = isLogin
      ? { email: form.email, password: form.password }
      : { ...form, timezone: browserTimezone() };
    mutation.mutate(body, {
      onSuccess: () => navigate(location.state?.from || '/', { replace: true }),
      onError: (err) => setErrors({ ...err.fields, _form: err.message }),
    });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-brand-300/15 bg-surface/40 p-12 lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 animate-pulse-glow rounded-full bg-neon-cyan/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 animate-pulse-glow rounded-full bg-neon-magenta/20 blur-3xl [animation-delay:1.5s]" aria-hidden />
        <Logo dark />
        <div className="relative">
          <p className="num text-xs uppercase tracking-[0.3em] text-brand-600 glow-cyan">// deadline intelligence</p>
          <h1 className="mt-4 max-w-lg font-display text-4xl font-extrabold leading-tight tracking-wide text-ink-950">
            Stop guessing which deadline to work on <span className="text-neon">next.</span>
          </h1>
          <p className="mt-5 max-w-md text-ink-600">
            DeadlineOS turns your assignments, exams and projects into a ranked to-do list and a study plan that fits
            the hours you actually have.
          </p>
          <ul className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-xl border border-brand-300/15 bg-ink-50/50 p-4 backdrop-blur">
                <Icon className="h-5 w-5 text-brand-600 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <p className="mt-2 font-medium text-ink-900">{title}</p>
                <p className="mt-1 text-sm text-ink-500">{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="num relative text-xs uppercase tracking-[0.2em] text-ink-400">Built for students juggling several courses at once</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-sm p-7 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <div className="lg:hidden">
            <Logo />
            <p className="mt-3 text-sm text-ink-600">
              Prioritise assignments, exams and projects, and get a study plan that fits your week.
            </p>
          </div>
          <h2 className="mt-8 page-title lg:mt-0">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {isLogin ? 'Log in to see your plan for today.' : 'It takes a few seconds. No card, no spam.'}
          </p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            {!isLogin && (
              <Field label="Name" error={errors.name} htmlFor="name">
                <input id="name" className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={set('name')} autoComplete="name" />
              </Field>
            )}
            <Field label="Email" error={errors.email} htmlFor="email">
              <input
                id="email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
            </Field>
            <Field label="Password" error={errors.password} hint={!isLogin ? 'At least 8 characters' : undefined} htmlFor="password">
              <input
                id="password"
                type="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                value={form.password}
                onChange={set('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </Field>

            {errors._form && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {errors._form}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner className="h-4 w-4 text-on-accent" />}
              {isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} className="font-medium text-brand-600 hover:underline">
              {isLogin ? 'Sign up' : 'Log in'}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
