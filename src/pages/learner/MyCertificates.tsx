import { useEffect, useMemo, useState } from 'react';
import { CertificateCard } from '../../components/CertificateCard';
import { EmptyState, PageHeader, PageLoader } from '../../components/ui';
import { learnerApi } from '../../lib/api';
import type { Certificate } from '../../types';

type Filter = 'all' | 'issued' | 'expired' | 'revoked' | 'pending';

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Hamısı' },
  { key: 'issued', label: 'Aktiv' },
  { key: 'expired', label: 'Müddəti bitib' },
  { key: 'revoked', label: 'Ləğv edilib' },
  { key: 'pending', label: 'Təsdiq gözləyir' },
];

/** Bölmə 3.3 — "Sertifikatlarım". */
export function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    learnerApi
      .certificates()
      .then(setCertificates)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('az-AZ');

    return certificates.filter((certificate) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'pending'
            ? certificate.acceptance === 'pending'
            : certificate.status === filter;

      if (!matchesFilter) return false;
      if (!term) return true;

      return (
        certificate.courseName.toLocaleLowerCase('az-AZ').includes(term) ||
        certificate.organizationName.toLocaleLowerCase('az-AZ').includes(term) ||
        certificate.uniqueCode.toLocaleLowerCase('az-AZ').includes(term)
      );
    });
  }, [certificates, filter, search]);

  const counts = useMemo(
    () => ({
      all: certificates.length,
      issued: certificates.filter((c) => c.status === 'issued').length,
      expired: certificates.filter((c) => c.status === 'expired').length,
      revoked: certificates.filter((c) => c.status === 'revoked').length,
      pending: certificates.filter((c) => c.acceptance === 'pending').length,
    }),
    [certificates],
  );

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Sertifikatlarım" description={`Ümumi ${certificates.length} sertifikat`} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
              <span className={filter === item.key ? 'ml-1.5 opacity-80' : 'ml-1.5 text-slate-400'}>
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Kurs, təşkilat və ya kod..."
          className="input sm:w-64"
          aria-label="Sertifikatlar arasında axtarış"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={certificates.length === 0 ? 'Hələ sertifikatınız yoxdur' : 'Nəticə tapılmadı'}
          description={
            certificates.length === 0
              ? 'Təşkilat sizin e-mail ünvanınıza sertifikat verdikdə o, avtomatik burada görünəcək.'
              : 'Axtarış şərtlərini dəyişərək yenidən cəhd edin.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </>
  );
}
