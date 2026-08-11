import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CertificateTemplate } from '../../components/CertificateTemplate';
import {
  AcceptanceBadge,
  Alert,
  DetailRow,
  PageLoader,
  Spinner,
  StatusBadge,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError, certificateApi, publicApi } from '../../lib/api';
import { downloadAsJpg, downloadAsPdf } from '../../lib/download';
import { formatDate } from '../../lib/format';
import type { Certificate } from '../../types';

/** Təşkilat tərəfindən sertifikatın detalları + ləğv etmə (bölmə 4.8). */
export function OrgCertificateDetail() {
  const { code = '' } = useParams();
  const { user } = useAuth();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    certificateApi
      .detail(code)
      .then((data) => {
        if (cancelled) return;
        setCertificate(data);
        return publicApi.qr(code).then((qr) => {
          if (!cancelled) setQrDataUrl(qr.dataUrl);
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Sertifikat yüklənmədi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  const handleRevoke = async () => {
    setBusy('revoke');
    setError(null);
    try {
      setCertificate(await certificateApi.revoke(code));
      setNotice('Sertifikat ləğv edildi. Qeyd bazadan silinmir — tarixçə qalır.');
      setConfirmRevoke(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ləğv etmə alınmadı');
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async (format: 'pdf' | 'jpg') => {
    if (!templateRef.current) return;
    setBusy(format);
    try {
      if (format === 'pdf') {
        await downloadAsPdf(templateRef.current, code);
      } else {
        await downloadAsJpg(templateRef.current, code);
      }
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <PageLoader />;

  if (!certificate) {
    return (
      <div className="card px-6 py-14 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Sertifikat tapılmadı</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link to="/teskilat/sertifikatlar" className="btn-primary mt-6">
          Siyahıya qayıt
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/teskilat/sertifikatlar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ← Sertifikatlar
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{certificate.learnerName}</h1>
          <p className="mt-1 text-slate-500">{certificate.courseName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={certificate.status} label={certificate.statusLabel} />
          <AcceptanceBadge acceptance={certificate.acceptance} />
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {notice && (
        <div className="mb-4">
          <Alert variant="success">{notice}</Alert>
        </div>
      )}

      <div className="card mb-6 overflow-hidden">
        <div className="overflow-x-auto bg-slate-100 p-4">
          <div className="mx-auto w-fit origin-top scale-[0.4] sm:scale-[0.55] md:scale-[0.7]">
            <div className="shadow-lift">
              <CertificateTemplate
                ref={templateRef}
                certificate={certificate}
                qrDataUrl={qrDataUrl}
                organizationLogo={user?.organization?.logo}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleDownload('pdf')}
          className="btn-primary"
          disabled={busy !== null}
        >
          {busy === 'pdf' && <Spinner className="h-4 w-4" />}
          PDF yüklə
        </button>
        <button
          type="button"
          onClick={() => handleDownload('jpg')}
          className="btn-secondary"
          disabled={busy !== null}
        >
          {busy === 'jpg' && <Spinner className="h-4 w-4" />}
          JPG yüklə
        </button>
        <a
          href={certificate.publicUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          Public səhifəni aç
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-2 text-base font-semibold text-slate-900">Məlumatlar</h2>
          <dl>
            <DetailRow label="Müdavim" value={certificate.learnerName} />
            <DetailRow label="E-mail" value={certificate.learnerEmail} />
            <DetailRow label="Kurs / proqram" value={certificate.courseName} />
            {certificate.grade && <DetailRow label="Qiymət / nəticə" value={certificate.grade} />}
            <DetailRow
              label="Sertifikat kodu"
              value={<span className="font-mono">{certificate.uniqueCode}</span>}
            />
            <DetailRow label="Verilmə tarixi" value={formatDate(certificate.issueDate)} />
            <DetailRow
              label="Bitmə tarixi"
              value={certificate.expiryDate ? formatDate(certificate.expiryDate) : 'Müddətsiz'}
            />
            <DetailRow
              label="Müdavim hesabı"
              value={
                certificate.isClaimed ? 'Hesaba bağlanıb' : 'Hələ qeydiyyatdan keçməyib'
              }
            />
            {certificate.additionalText && (
              <DetailRow label="Əlavə mətn" value={certificate.additionalText} />
            )}
          </dl>
        </section>

        {/* Bölmə 4.8 — ləğv etmə */}
        <section className="card p-6">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Sertifikatı ləğv et</h2>
          <p className="mb-4 text-sm leading-relaxed text-slate-500">
            Səhv və ya etibarsız sertifikatı deaktiv edin. Qeyd bazadan{' '}
            <strong className="text-slate-700">silinmir</strong> — statusu «ləğv edilib» olur və
            tarixçə tam qalır. Yoxlayan şəxs sertifikatın ləğv edildiyini görəcək.
          </p>

          {certificate.status === 'revoked' ? (
            <Alert variant="warning">Bu sertifikat artıq ləğv edilib.</Alert>
          ) : confirmRevoke ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">
                {certificate.uniqueCode} kodlu sertifikatı ləğv etmək istədiyinizə əminsiniz?
              </p>
              <p className="mt-1 text-sm text-red-700">Bu əməliyyat geri qaytarıla bilməz.</p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleRevoke}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  disabled={busy !== null}
                >
                  {busy === 'revoke' && <Spinner className="h-4 w-4" />}
                  Bəli, ləğv et
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRevoke(false)}
                  className="btn-secondary"
                  disabled={busy !== null}
                >
                  İmtina
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmRevoke(true)} className="btn-danger">
              Ləğv et
            </button>
          )}
        </section>
      </div>
    </>
  );
}
