import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, PageHeader, SearchIcon, Spinner, StatusBadge } from '../../components/ui';
import { certificateApi } from '../../lib/api';
import { formatDate } from '../../lib/format';
import type { Certificate, Pagination } from '../../types';

type StatusFilter = 'all' | 'issued' | 'expired' | 'revoked';

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'Hamısı' },
  { key: 'issued', label: 'Aktiv' },
  { key: 'expired', label: 'Müddəti bitib' },
  { key: 'revoked', label: 'Ləğv edilib' },
];

/** Bölmə 4.3 və 4.4 — sertifikatlar cədvəli və axtarış. */
export function OrgCertificates() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await certificateApi.list({ search, status, page, limit: 20 });
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  // Axtarış yazarkən hər hərfdə sorğu getməsin deyə kiçik gecikmə qoyulur.
  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  // Filtr dəyişdikdə birinci səhifəyə qayıdırıq.
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  return (
    <>
      <PageHeader
        title="Sertifikatlar"
        description={
          pagination ? `${pagination.total} sertifikat tapıldı` : 'Verdiyiniz bütün sertifikatlar'
        }
        action={
          <Link to="/teskilat/yeni-sertifikat" className="btn-primary">
            + Yeni sertifikat
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Ad, soyad, e-mail, kod və ya kurs adı..."
          className="input lg:w-96"
          aria-label="Sertifikat axtarışı"
        />

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setStatus(item.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                status === item.key
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={search ? <SearchIcon className="h-6 w-6" /> : undefined}
          title={search ? 'Nəticə tapılmadı' : 'Hələ sertifikat yoxdur'}
          description={
            search
              ? 'Axtarış şərtlərini dəyişərək yenidən cəhd edin.'
              : 'İlk sertifikatınızı yaradın — kod avtomatik veriləcək.'
          }
          action={
            !search && (
              <Link to="/teskilat/yeni-sertifikat" className="btn-primary">
                Yeni sertifikat yarat
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Masaüstü: cədvəl */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium text-slate-600">Müdavim</th>
                  <th className="px-5 py-3 font-medium text-slate-600">Kurs</th>
                  <th className="px-5 py-3 font-medium text-slate-600">Kod</th>
                  <th className="px-5 py-3 font-medium text-slate-600">Tarix</th>
                  <th className="px-5 py-3 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((certificate) => (
                  <tr key={certificate.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/teskilat/sertifikatlar/${certificate.uniqueCode}`}
                        className="block"
                      >
                        <span className="font-medium text-slate-900">
                          {certificate.learnerName}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {certificate.learnerEmail}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{certificate.courseName}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-brand-700">
                        {certificate.uniqueCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(certificate.issueDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={certificate.status} label={certificate.statusLabel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil: kartlar */}
          <div className="space-y-3 md:hidden">
            {items.map((certificate) => (
              <Link
                key={certificate.id}
                to={`/teskilat/sertifikatlar/${certificate.uniqueCode}`}
                className="card block p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{certificate.learnerName}</p>
                    <p className="truncate text-sm text-slate-500">{certificate.courseName}</p>
                  </div>
                  <StatusBadge status={certificate.status} label={certificate.statusLabel} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="font-mono text-brand-700">{certificate.uniqueCode}</span>
                  <span className="text-slate-500">{formatDate(certificate.issueDate)}</span>
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                ← Əvvəlki
              </button>
              <span className="text-sm text-slate-500">
                Səhifə {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={page >= pagination.totalPages}
                className="btn-secondary"
              >
                Növbəti →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
