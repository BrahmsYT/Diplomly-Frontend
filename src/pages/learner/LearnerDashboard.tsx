import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CertificateCard } from '../../components/CertificateCard';
import { Alert, EmptyState, PageHeader, PageLoader, StatCard } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError, learnerApi } from '../../lib/api';
import type { Certificate, LearnerStats } from '../../types';

/** Bölmə 3.2 — müdavim dashboard. */
export function LearnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<LearnerStats | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([learnerApi.stats(), learnerApi.certificates()])
      .then(([statsData, certificatesData]) => {
        setStats(statsData);
        setCertificates(certificatesData);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Məlumatlar yüklənmədi'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const pending = certificates.filter((cert) => cert.acceptance === 'pending');

  return (
    <>
      <PageHeader
        title={`Salam, ${user?.name}`}
        description="Aldığınız bütün sertifikatlar bir yerdə."
      />

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {/* Bölmə 7, addım 6 — təsdiq gözləyən sertifikatlar */}
      {pending.length > 0 && (
        <div className="mb-6">
          <Alert variant="info">
            <span className="font-medium">
              {pending.length} sertifikat təsdiqinizi gözləyir.
            </span>{' '}
            Sertifikatı açaraq təsdiqləyin və ya imtina edin.
          </Alert>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Ümumi sertifikat" value={stats?.total ?? 0} />
        <StatCard label="Aktiv" value={stats?.active ?? 0} accent="emerald" />
        <StatCard label="Müddəti bitib" value={stats?.expired ?? 0} accent="amber" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Son sertifikatlar</h2>
        {certificates.length > 0 && (
          <Link
            to="/panel/sertifikatlar"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Hamısına bax →
          </Link>
        )}
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          title="Hələ sertifikatınız yoxdur"
          description="Təşkilat sizin e-mail ünvanınıza sertifikat verdikdə o, avtomatik burada görünəcək."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.slice(0, 4).map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </>
  );
}
