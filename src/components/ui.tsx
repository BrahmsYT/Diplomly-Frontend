import type { ReactNode } from 'react';
import type { CertStatus } from '../types';

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}

export function PageLoader({ label = 'Yüklənir...' }: { label?: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-8 w-8 text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Alert({
  variant = 'error',
  children,
}: {
  variant?: 'error' | 'success' | 'info' | 'warning';
  children: ReactNode;
}) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-brand-200 bg-brand-50 text-brand-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }[variant];

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role="alert">
      {children}
    </div>
  );
}

/** Bölmə 4.7 — status rənglə fərqləndirilir. */
export function StatusBadge({ status, label }: { status: CertStatus | string; label?: string }) {
  const config: Record<string, { classes: string; text: string }> = {
    issued: { classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', text: 'Aktiv' },
    expired: { classes: 'bg-amber-50 text-amber-700 ring-amber-600/20', text: 'Müddəti bitib' },
    revoked: { classes: 'bg-red-50 text-red-700 ring-red-600/20', text: 'Ləğv edilib' },
  };

  const { classes, text } = config[status] ?? {
    classes: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    text: status,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {label ?? text}
    </span>
  );
}

/** Müdavimin təsdiq vəziyyəti (bölmə 7, addım 6). */
export function AcceptanceBadge({ acceptance }: { acceptance: string }) {
  if (acceptance === 'accepted') return null;

  const config: Record<string, { classes: string; text: string }> = {
    pending: { classes: 'bg-brand-50 text-brand-700 ring-brand-600/20', text: 'Təsdiq gözləyir' },
    rejected: { classes: 'bg-slate-100 text-slate-600 ring-slate-500/20', text: 'İmtina edilib' },
  };

  const item = config[acceptance];
  if (!item) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${item.classes}`}
    >
      {item.text}
    </span>
  );
}

export function StatCard({
  label,
  value,
  accent = 'slate',
  hint,
}: {
  label: string;
  value: number | string;
  accent?: 'slate' | 'brand' | 'emerald' | 'amber' | 'red';
  hint?: string;
}) {
  const accents = {
    slate: 'text-slate-900',
    brand: 'text-brand-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  }[accent];

  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums ${accents}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = '📄',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 text-4xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Detal səhifələrində "etiket → dəyər" sətri. */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 sm:text-right">{value ?? '—'}</dd>
    </div>
  );
}

export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg bg-brand-600 text-white ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 3L2 8l10 5 10-5-10-5z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M5 11v4.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V11l-7 3.5L5 11z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
