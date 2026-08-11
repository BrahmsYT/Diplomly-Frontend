import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, PageLoader, Spinner } from '../../components/ui';
import { ApiError, testApi, type SeedStatus } from '../../lib/api';
import { copyToClipboard } from '../../lib/download';

/**
 * `/test` — demo səhifəsi.
 *
 * Deploy edildikdən sonra baza boş olur. Bu səhifə həm sınaq hesablarını
 * göstərir, həm də bir düymə ilə nümunə məlumatları yaradır — serverə
 * terminal ilə qoşulmağa ehtiyac qalmır.
 */
export function TestData() {
  const [status, setStatus] = useState<SeedStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStatus(await testApi.status());
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Backend ilə əlaqə qurulmadı. Server işləyirmi?',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSeed = async () => {
    setSeeding(true);
    setError(null);
    setNotice(null);

    try {
      const result = await testApi.seed();
      setNotice(
        `${result.certificates} sertifikat yaradıldı (${result.firstCode} … ${result.lastCode}), ` +
          `${result.organizations} təşkilat, ${result.courses} kurs.`,
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Məlumatlar yaradıla bilmədi');
    } finally {
      setSeeding(false);
    }
  };

  const handleCopy = async (value: string) => {
    if (await copyToClipboard(value)) {
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  if (loading) return <PageLoader label="Bazanın vəziyyəti yoxlanılır..." />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
        Demo səhifəsi
      </span>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Sınaq məlumatları</h1>
      <p className="mt-2 text-slate-600">
        Sistemi sınamaq üçün hazır hesablar. Baza boşdursa aşağıdakı düymə ilə nümunə məlumatları
        yaradın.
      </p>

      {error && (
        <div className="mt-6">
          <Alert>{error}</Alert>
        </div>
      )}
      {notice && (
        <div className="mt-6">
          <Alert variant="success">{notice}</Alert>
        </div>
      )}

      {/* Hesablar */}
      <div className="card mt-8 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Hesablar</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {status?.accounts.map((account) => (
            <div
              key={account.email}
              className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
                  {account.role}
                </p>
                <p className="mt-0.5 truncate font-mono text-sm text-slate-900">{account.email}</p>
                <p className="text-xs text-slate-500">{account.label}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(account.email)}
                className="btn-secondary shrink-0 py-1.5 text-xs"
              >
                {copied === account.email ? 'Kopyalandı ✓' : 'Kopyala'}
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between bg-slate-50 px-6 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Şifrə (hamısı üçün)
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                {status?.password ?? 'parol123'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(status?.password ?? 'parol123')}
              className="btn-secondary shrink-0 py-1.5 text-xs"
            >
              {copied === status?.password ? 'Kopyalandı ✓' : 'Kopyala'}
            </button>
          </div>
        </div>
      </div>

      {/* Bazanın vəziyyəti */}
      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Bazanın vəziyyəti</h2>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
              status?.seeded
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                : 'bg-amber-50 text-amber-700 ring-amber-600/20'
            }`}
          >
            {status?.seeded ? 'Məlumat var' : 'Boşdur'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ['İstifadəçi', status?.counts.users],
              ['Təşkilat', status?.counts.organizations],
              ['Kurs', status?.counts.courses],
              ['Sertifikat', status?.counts.certificates],
            ] as Array<[string, number | undefined]>
          ).map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-slate-900">{value ?? 0}</p>
              <p className="mt-0.5 text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSeed}
          className="btn-primary mt-5 w-full"
          disabled={seeding}
        >
          {seeding && <Spinner className="h-4 w-4" />}
          {status?.seeded ? 'Məlumatları yenidən yarat' : 'Nümunə məlumatları yarat'}
        </button>

        {status?.seeded && (
          <p className="mt-3 text-center text-xs text-amber-700">
            Diqqət: mövcud bütün sertifikat və hesablar silinib yenidən yaradılacaq.
          </p>
        )}
      </div>

      {/* Nə yaradılır */}
      <div className="card mt-6 p-6">
        <h2 className="mb-3 font-semibold text-slate-900">Nə yaradılır</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            '2 təşkilat — ABC Academy və XYZ Training',
            '1 müdavim hesabı — 3 sertifikatı var',
            '7 kurs (kurs kataloqu, bölmə 4.5)',
            '6 sertifikat: DPL-000001 … DPL-000006',
            'Nümunə hallar: aktiv, müddəti bitmiş, ləğv edilmiş, təsdiq gözləyən',
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Yoxlamaq üçün kodlar */}
      <div className="card mt-6 p-6">
        <h2 className="mb-3 font-semibold text-slate-900">Yoxlama üçün nümunə kodlar</h2>
        <div className="space-y-2">
          {(
            [
              ['DPL-000001', 'Aktiv sertifikat'],
              ['DPL-000002', 'Müddəti bitib'],
              ['DPL-000005', 'Ləğv edilib'],
              ['saleh@example.com', 'E-mail ilə axtarış'],
            ] as Array<[string, string]>
          ).map(([code, label]) => (
            <Link
              key={code}
              to={`/yoxla?q=${encodeURIComponent(code)}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="font-mono text-sm text-slate-900">{code}</span>
              <span className="text-xs text-slate-500">{label} →</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/daxil-ol" className="btn-primary">
          Daxil ol
        </Link>
        <Link to="/" className="btn-secondary">
          Ana səhifə
        </Link>
      </div>
    </div>
  );
}
