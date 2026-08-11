import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, PageHeader, PageLoader, StatCard, StatusBadge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { orgApi } from '../../lib/api';
import { formatDate } from '../../lib/format';
import type { OrganizationStats } from '../../types';

/** Bölmə 4.2 — təşkilat dashboard. */
export function OrgDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgApi
      .stats()
      .then(setStats)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title={user?.organization?.name ?? 'Dashboard'}
        description="Verdiyiniz sertifikatların ümumi statistikası."
        action={
          <Link to="/teskilat/yeni-sertifikat" className="btn-primary">
            + Yeni sertifikat
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Ümumi sertifikat" value={stats?.total ?? 0} />
        <StatCard label="Bu ay" value={stats?.thisMonth ?? 0} accent="brand" />
        <StatCard label="Aktiv" value={stats?.active ?? 0} accent="emerald" />
        <StatCard label="Müddəti bitib" value={stats?.expired ?? 0} accent="amber" />
        <StatCard label="Ləğv edilib" value={stats?.revoked ?? 0} accent="red" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Son verilən sertifikatlar</h2>
        <Link
          to="/teskilat/sertifikatlar"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Hamısına bax →
        </Link>
      </div>

      {!stats || stats.recent.length === 0 ? (
        <EmptyState
          icon="📜"
          title="Hələ sertifikat verməmisiniz"
          description="İlk sertifikatı yaratmaq üçün aşağıdakı düyməyə basın. Kod avtomatik veriləcək."
          action={
            <Link to="/teskilat/yeni-sertifikat" className="btn-primary">
              Yeni sertifikat yarat
            </Link>
          }
        />
      ) : (
        <div className="card divide-y divide-slate-100">
          {stats.recent.map((item) => (
            <Link
              key={item.uniqueCode}
              to={`/teskilat/sertifikatlar/${item.uniqueCode}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{item.learnerName}</p>
                <p className="truncate text-sm text-slate-500">{item.courseName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="hidden text-sm text-slate-500 sm:block">
                  {formatDate(item.issueDate)}
                </span>
                <span className="hidden font-mono text-xs text-slate-400 md:block">
                  {item.uniqueCode}
                </span>
                <StatusBadge status={item.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
