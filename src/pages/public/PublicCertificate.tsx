import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CertificateTemplate } from '../../components/CertificateTemplate';
import { Alert, PageLoader, SearchIcon, Spinner, StatusBadge } from '../../components/ui';
import { ApiError, publicApi } from '../../lib/api';
import { copyToClipboard, downloadAsJpg, downloadAsPdf } from '../../lib/download';
import { formatDate } from '../../lib/format';
import type { PublicCertificate as PublicCertificateType } from '../../types';

/**
 * Bölmə 3.6 — paylaşılan unikal URL: /certificate/DPL-000245
 * QR kod da bu səhifəyə yönləndirir (bölmə 7, addım 8).
 */
export function PublicCertificatePage() {
  const { code = '' } = useParams();

  const [certificate, setCertificate] = useState<PublicCertificateType | null>(null);
  const [verdict, setVerdict] = useState<'verified' | 'revoked' | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'pdf' | 'jpg' | null>(null);
  const [copied, setCopied] = useState(false);

  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    publicApi
      .certificate(code)
      .then((data) => {
        if (cancelled || data.result === 'not_found') return;
        setCertificate(data.certificate);
        setVerdict(data.result);
        return publicApi.qr(code).then((qr) => {
          if (!cancelled) setQrDataUrl(qr.dataUrl);
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Sertifikat yüklənə bilmədi');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

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

  const handleCopy = async () => {
    if (await copyToClipboard(window.location.href)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <PageLoader label="Sertifikat yüklənir..." />;

  if (error || !certificate) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="card px-6 py-14">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded border border-slate-200 text-slate-400">
            <SearchIcon className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Sertifikat tapılmadı</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {error ?? 'Daxil etdiyiniz sertifikat kodunu yoxlayaraq yenidən cəhd edin.'}
          </p>
          <Link to="/yoxla" className="btn-primary mt-6">
            Başqa sertifikat yoxla
          </Link>
        </div>
      </div>
    );
  }

  const isRevoked = verdict === 'revoked';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Doğrulama nəticəsi — bölmə 5.3 / 5.5 */}
      <div
        className={`mb-6 flex flex-col gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
          isRevoked ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'
        }`}
      >
        <div>
          <p className={`text-lg font-semibold ${isRevoked ? 'text-red-800' : 'text-emerald-800'}`}>
            {isRevoked ? 'Bu sertifikat ləğv edilib' : 'Sertifikat təsdiqləndi'}
          </p>
          <p className={`text-sm ${isRevoked ? 'text-red-700' : 'text-emerald-700'}`}>
            {isRevoked
              ? 'Verən təşkilat bu sertifikatı etibarsız elan edib.'
              : 'Diplomly vasitəsilə təsdiqlənib'}
          </p>
        </div>
        <StatusBadge status={certificate.status} label={certificate.statusLabel} />
      </div>

      {isRevoked && (
        <div className="mb-6">
          <Alert variant="warning">
            Bu sənəd Diplomly sistemində mövcuddur, lakin artıq etibarlı deyil.
          </Alert>
        </div>
      )}

      {/* Sertifikatın görüntüsü */}
      <div className="card mb-6 overflow-hidden">
        <div className="overflow-x-auto bg-slate-100 p-4 sm:p-6">
          <div className="mx-auto w-fit origin-top scale-[0.42] sm:scale-[0.6] md:scale-[0.75] lg:scale-90">
            <div className="shadow-lift">
              <CertificateTemplate
                ref={templateRef}
                certificate={certificate}
                qrDataUrl={qrDataUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bölmə 3.7 — yükləmə, 3.6 — paylaşma */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleDownload('pdf')}
          className="btn-primary"
          disabled={busy !== null}
        >
          {busy === 'pdf' ? <Spinner className="h-4 w-4" /> : null}
          PDF yüklə
        </button>
        <button
          type="button"
          onClick={() => handleDownload('jpg')}
          className="btn-secondary"
          disabled={busy !== null}
        >
          {busy === 'jpg' ? <Spinner className="h-4 w-4" /> : null}
          JPG yüklə
        </button>
        <button type="button" onClick={handleCopy} className="btn-secondary">
          {copied ? 'Kopyalandı ✓' : 'Linki kopyala'}
        </button>
      </div>

      {/* Məlumat cədvəli */}
      <div className="card p-6">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Sertifikat məlumatları</h2>
        <dl>
          {(
            [
              ['Müdavimin adı', certificate.learnerName],
              ['Kurs / proqram', certificate.courseName],
              ['Təşkilat', certificate.organizationName],
              ...(certificate.grade ? [['Qiymət / nəticə', certificate.grade]] : []),
              ['Sertifikat kodu', certificate.uniqueCode],
              ['Verilmə tarixi', formatDate(certificate.issueDate)],
              [
                'Bitmə tarixi',
                certificate.expiryDate ? formatDate(certificate.expiryDate) : 'Müddətsiz',
              ],
              ['Status', certificate.statusLabel],
              ...(certificate.headName ? [['Rəhbər', certificate.headName]] : []),
              ...(certificate.additionalText ? [['Əlavə məlumat', certificate.additionalText]] : []),
            ] as Array<[string, string]>
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="text-sm font-medium text-slate-900 sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Bu sertifikat{' '}
        <Link to="/" className="font-medium text-brand-600 hover:text-brand-700">
          Diplomly
        </Link>{' '}
        sistemində saxlanılır və istənilən vaxt yoxlanıla bilər.
      </p>
    </div>
  );
}
