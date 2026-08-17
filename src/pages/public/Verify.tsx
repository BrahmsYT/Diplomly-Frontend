import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError, publicApi } from '../../lib/api';
import { formatDate } from '../../lib/format';
import type { PublicCertificate, VerifyResult } from '../../types';
import { Alert, Spinner, StatusBadge } from '../../components/ui';

/** Bölmə 5 — ümumi axtarış / verify paneli. Login tələb olunmur. */
export function Verify() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setResult(await publicApi.verify(trimmed));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Axtarış zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

  // URL-dəki ?q= dəyəri ilə səhifə açıldıqda axtarış avtomatik işə düşür
  // (ana səhifədən yönləndirmə və paylaşılan linklər üçün).
  useEffect(() => {
    if (initialQuery) void runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
    void runSearch(trimmed);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
        Sertifikatı yoxla
      </h1>
      <p className="mt-2 text-slate-600">
        Sertifikat kodunu və ya müdavimin e-mail ünvanını daxil edin.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="DPL-000001 və ya name@example.com"
          className="input flex-1 py-3 text-base"
          aria-label="Sertifikat kodu və ya e-mail"
        />
        <button type="submit" className="btn-primary py-3 sm:px-8" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : 'Yoxla'}
        </button>
      </form>

      <div className="mt-8">
        {error && <Alert>{error}</Alert>}

        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Spinner className="h-6 w-6 text-brand-600" />
          </div>
        )}

        {!loading && result && <VerifyResultView result={result} />}
      </div>
    </div>
  );
}

function VerifyResultView({ result }: { result: VerifyResult }) {
  // --- Bölmə 5.2: e-mail ilə axtarış nəticəsi ---
  if (result.type === 'email') {
    if (result.result === 'not_found') {
      return <NotFoundView message={result.message} />;
    }

    return (
      <div>
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckIcon />
          <p className="font-medium text-emerald-800">{result.message}</p>
        </div>

        <div className="space-y-3">
          {result.certificates.map((certificate) => (
            <Link
              key={certificate.uniqueCode}
              to={`/certificate/${certificate.uniqueCode}`}
              className="card flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-lift"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{certificate.courseName}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {certificate.organizationName} · {formatDate(certificate.issueDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={certificate.status} label={certificate.statusLabel} />
                <span className="font-mono text-xs text-slate-400">{certificate.uniqueCode}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // --- Bölmə 5.4: sertifikat tapılmadıqda ---
  if (result.result === 'not_found') {
    return <NotFoundView message={result.message} hint={result.hint} />;
  }

  // --- Bölmə 5.5: ləğv edilmiş sertifikat gizlədilmir ---
  const isRevoked = result.result === 'revoked';

  return (
    <div className="card overflow-hidden">
      <div
        className={`flex items-center gap-3 border-b px-6 py-5 ${
          isRevoked ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'
        }`}
      >
        {isRevoked ? <XIcon /> : <CheckIcon />}
        <div>
          <p
            className={`text-lg font-semibold ${isRevoked ? 'text-red-800' : 'text-emerald-800'}`}
          >
            {result.message}
          </p>
          <p className={`text-sm ${isRevoked ? 'text-red-700' : 'text-emerald-700'}`}>
            {isRevoked
              ? 'Bu sertifikat verən təşkilat tərəfindən etibarsız elan edilib.'
              : 'Diplomly vasitəsilə təsdiqlənib'}
          </p>
        </div>
      </div>

      <CertificateDetails certificate={result.certificate} />

      <div className="border-t border-slate-100 px-6 py-4">
        <Link
          to={`/certificate/${result.certificate.uniqueCode}`}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Sertifikat səhifəsini aç →
        </Link>
      </div>
    </div>
  );
}

/** Bölmə 5.3 — doğrulama nəticəsində göstərilən məlumatlar. */
function CertificateDetails({ certificate }: { certificate: PublicCertificate }) {
  const rows: Array<[string, string]> = [
    ['Müdavimin adı', certificate.learnerName],
    ['Kurs', certificate.courseName],
    ['Təşkilat', certificate.organizationName],
    ['Sertifikat kodu', certificate.uniqueCode],
    ['Verilmə tarixi', formatDate(certificate.issueDate)],
    ['Bitmə tarixi', certificate.expiryDate ? formatDate(certificate.expiryDate) : '—'],
    ['Status', certificate.statusLabel],
  ];

  if (certificate.grade) rows.splice(2, 0, ['Qiymət / nəticə', certificate.grade]);

  return (
    <dl className="px-6 py-2">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0"
        >
          <dt className="text-sm text-slate-500">{label}</dt>
          <dd className="text-right text-sm font-medium text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function NotFoundView({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded border border-slate-200 text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
          <path
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{message}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hint ?? 'Daxil etdiyiniz məlumatı yoxlayaraq yenidən cəhd edin.'}
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 shrink-0 text-emerald-600">
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 shrink-0 text-red-600">
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 00-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
        clipRule="evenodd"
      />
    </svg>
  );
}
