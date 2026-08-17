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
      <Spinner className="h-8 w-8 text-brand-700" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function DocumentIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5h6.5L18 8v11.5a1 1 0 01-1 1H7a1 1 0 01-1-1V4.5a1 1 0 011-1z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.5V8H18" />
    </svg>
  );
}

export function SearchIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path strokeLinecap="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
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
    error: 'border-red-600 bg-red-50 text-red-900',
    success: 'border-emerald-600 bg-emerald-50 text-emerald-900',
    info: 'border-slate-500 bg-slate-100 text-slate-800',
    warning: 'border-amber-500 bg-amber-50 text-amber-900',
  }[variant];

  return (
    <div className={`rounded-sm border-l-4 px-4 py-3 text-sm ${styles}`} role="alert">
      {children}
    </div>
  );
}

/** Bölmə 4.7 — status rənglə fərqləndirilir; kvadrat teq, pill yox. */
export function StatusBadge({ status, label }: { status: CertStatus | string; label?: string }) {
  const config: Record<string, { classes: string; text: string }> = {
    issued: { classes: 'border-emerald-200 bg-emerald-50 text-emerald-800', text: 'Aktiv' },
    expired: { classes: 'border-amber-200 bg-amber-50 text-amber-800', text: 'Müddəti bitib' },
    revoked: { classes: 'border-red-200 bg-red-50 text-red-800', text: 'Ləğv edilib' },
  };

  const { classes, text } = config[status] ?? {
    classes: 'border-slate-200 bg-slate-100 text-slate-700',
    text: status,
  };

  return <span className={`tag ${classes}`}>{label ?? text}</span>;
}

/** Müdavimin təsdiq vəziyyəti (bölmə 7, addım 6). */
export function AcceptanceBadge({ acceptance }: { acceptance: string }) {
  if (acceptance === 'accepted') return null;

  const config: Record<string, { classes: string; text: string }> = {
    pending: { classes: 'border-brand-200 bg-brand-50 text-brand-800', text: 'Təsdiq gözləyir' },
    rejected: { classes: 'border-slate-200 bg-slate-100 text-slate-600', text: 'İmtina edilib' },
  };

  const item = config[acceptance];
  if (!item) return null;

  return <span className={`tag ${item.classes}`}>{item.text}</span>;
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
    brand: 'text-brand-700',
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
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
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded border border-slate-200 text-slate-400">
        {icon ?? <DocumentIcon className="h-6 w-6" />}
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
        <h1 className="font-display text-2xl font-semibold text-slate-900">{title}</h1>
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

/** Diplomly-nin nişanı: dalğalı kənarlı mum-möhür + lent quyruqları. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 29" fill="none" className={`shrink-0 text-brand-700 ${className}`} aria-hidden="true">
      {/* Lent quyruqları — aşağı endikcə bir-birindən aralanır */}
      <path
        fill="currentColor"
        d="M9.5 18.5L11.5 18.5L8.9 27.6L7.4 25.3L5.9 27.6Z M14.5 18.5L12.5 18.5L15.1 27.6L16.6 25.3L18.1 27.6Z"
      />
      {/* Möhürün dalğalı (scalloped) kənarı */}
      <path
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        d="M12 3.5Q13.94 2.02 15.04 4.19Q17.42 3.7 17.47 6.14Q19.84 6.73 18.82 8.94Q20.7 10.5 18.82 12.06Q19.84 14.27 17.47 14.86Q17.42 17.3 15.04 16.81Q13.94 18.98 12 17.5Q10.06 18.98 8.96 16.81Q6.58 17.3 6.53 14.86Q4.16 14.27 5.18 12.06Q3.3 10.5 5.18 8.94Q4.16 6.73 6.53 6.14Q6.58 3.7 8.96 4.19Q10.06 2.02 12 3.5Z"
      />
      {/* Daxili damğa çərçivəsi + təsdiq işarəsi */}
      <circle cx="12" cy="10.5" r="5.6" stroke="currentColor" strokeWidth="0.9" />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.4 10.7L11 12.3L14.7 8.8"
      />
    </svg>
  );
}
