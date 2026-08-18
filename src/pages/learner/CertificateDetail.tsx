import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CertificatePreview } from '../../components/CertificatePreview';
import { AcceptanceBadge, Alert, DetailRow, PageLoader, Spinner, StatusBadge } from '../../components/ui';
import { ApiError, learnerApi, publicApi } from '../../lib/api';
import { copyToClipboard, downloadAsJpg, downloadAsPdf } from '../../lib/download';
import { formatDate } from '../../lib/format';
import type { Certificate, Visibility } from '../../types';

/**
 * Bölmə 3.4 — sertifikatın detallı səhifəsi.
 * Burada eyni zamanda 3.5 (görünürlük), 3.6 (paylaşma), 3.7 (yükləmə) və
 * bölmə 7-nin 6-cı addımı (təsdiq / imtina) yerinə yetirilir.
 */
export function CertificateDetail() {
  const { code = '' } = useParams();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    learnerApi
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

  const handleVisibility = async (visibility: Visibility) => {
    setBusy('visibility');
    setError(null);
    try {
      setCertificate(await learnerApi.setVisibility(code, visibility));
      setNotice(
        visibility === 'only_me'
          ? 'Sertifikat artıq ümumi axtarışda görünmür.'
          : 'Sertifikat kod və e-mail ilə tapıla bilər.',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ayar dəyişdirilə bilmədi');
    } finally {
      setBusy(null);
    }
  };

  const handleDecision = async (decision: 'accepted' | 'rejected') => {
    setBusy(decision);
    setError(null);
    try {
      setCertificate(await learnerApi.decide(code, decision));
      setNotice(
        decision === 'accepted'
          ? 'Sertifikat təsdiqləndi.'
          : 'Sertifikatdan imtina etdiniz — o, ümumi axtarışdan çıxarıldı.',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Əməliyyat alınmadı');
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

  const handleCopy = async () => {
    if (!certificate) return;
    if (await copyToClipboard(certificate.publicUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <PageLoader />;

  if (!certificate) {
    return (
      <div className="card px-6 py-14 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Sertifikat tapılmadı</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link to="/panel/sertifikatlar" className="btn-primary mt-6">
          Sertifikatlarıma qayıt
        </Link>
      </div>
    );
  }

  const shareText = encodeURIComponent(
    `${certificate.courseName} — ${certificate.organizationName} sertifikatı: ${certificate.publicUrl}`,
  );

  return (
    <>
      <Link
        to="/panel/sertifikatlar"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ← Sertifikatlarım
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{certificate.courseName}</h1>
          <p className="mt-1 text-slate-500">{certificate.organizationName}</p>
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

      {/* Bölmə 7, addım 6 — təsdiq / imtina */}
      {certificate.acceptance === 'pending' && certificate.status !== 'revoked' && (
        <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <h2 className="font-semibold text-brand-900">Bu sertifikatı təsdiqləyirsiniz?</h2>
          <p className="mt-1 text-sm text-brand-800">
            {certificate.organizationName} sizin adınıza bu sertifikatı verib. Təsdiqləyin və ya
            sizə aid deyilsə imtina edin.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleDecision('accepted')}
              className="btn-primary"
              disabled={busy !== null}
            >
              {busy === 'accepted' && <Spinner className="h-4 w-4" />}
              Təsdiqləyirəm
            </button>
            <button
              type="button"
              onClick={() => handleDecision('rejected')}
              className="btn-secondary"
              disabled={busy !== null}
            >
              {busy === 'rejected' && <Spinner className="h-4 w-4" />}
              İmtina edirəm
            </button>
          </div>
        </div>
      )}

      {/* Sertifikatın görüntüsü */}
      <div className="card mb-6 overflow-hidden">
        <div className="bg-slate-100 p-3 sm:p-5">
          <div className="shadow-lift">
            <CertificatePreview
              ref={templateRef}
              certificate={certificate}
              qrDataUrl={qrDataUrl}
            />
          </div>
        </div>
      </div>

      {/* Bölmə 3.7 — yükləmə */}
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bölmə 3.4 — məlumatlar */}
        <section className="card p-6">
          <h2 className="mb-2 text-base font-semibold text-slate-900">Sertifikat məlumatları</h2>
          <dl>
            <DetailRow label="Sertifikat sahibi" value={certificate.learnerName} />
            <DetailRow label="Kurs / proqram" value={certificate.courseName} />
            <DetailRow label="Təşkilat" value={certificate.organizationName} />
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
              label="Status"
              value={<StatusBadge status={certificate.status} label={certificate.statusLabel} />}
            />
            {certificate.headName && <DetailRow label="Rəhbər" value={certificate.headName} />}
            {certificate.additionalText && (
              <DetailRow label="Əlavə məlumat" value={certificate.additionalText} />
            )}
          </dl>
        </section>

        <div className="space-y-6">
          {/* Bölmə 3.6 — paylaşma */}
          <section className="card p-6">
            <h2 className="mb-1 text-base font-semibold text-slate-900">Sertifikatı paylaş</h2>
            <p className="mb-4 text-sm text-slate-500">
              Bu linki açan istənilən şəxs sertifikatın həqiqiliyini görə bilər.
            </p>

            <div className="flex gap-2">
              <input
                readOnly
                value={certificate.publicUrl}
                className="input flex-1 bg-slate-50 font-mono text-xs"
                onFocus={(event) => event.target.select()}
                aria-label="Public sertifikat linki"
              />
              <button type="button" onClick={handleCopy} className="btn-secondary shrink-0">
                {copied ? '✓' : 'Kopyala'}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.publicUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                LinkedIn
              </a>
              <a
                href={`https://wa.me/?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent('Diplomly sertifikatı')}&body=${shareText}`}
                className="btn-secondary"
              >
                E-mail
              </a>
            </div>

            {qrDataUrl && (
              <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-5">
                <img src={qrDataUrl} alt="QR kod" className="h-20 w-20" />
                <p className="text-xs text-slate-500">
                  QR kodu skan edən şəxs birbaşa sertifikatın public səhifəsinə keçir.
                </p>
              </div>
            )}
          </section>

          {/* Bölmə 3.5 — görünürlük ayarı */}
          <section className="card p-6">
            <h2 className="mb-1 text-base font-semibold text-slate-900">Görünürlük</h2>
            <p className="mb-4 text-sm text-slate-500">
              Sertifikatın ümumi axtarışda necə görünəcəyini seçin.
            </p>

            <div className="space-y-2">
              {(
                [
                  {
                    value: 'searchable',
                    title: 'E-mail və ya kodla tapıla bilər',
                    description:
                      'Sertifikat kodu və ya e-mail ünvanınızla axtaran hər kəs sertifikatı görə bilər.',
                  },
                  {
                    value: 'only_me',
                    title: 'Yalnız mən görə bilərəm',
                    description:
                      'Sertifikat ümumi axtarış sistemində görünmür. Paylaşdığınız link də işləməyəcək.',
                  },
                ] as const
              ).map((option) => {
                const selected = certificate.visibility === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleVisibility(option.value)}
                    disabled={busy !== null || selected}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      selected
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? 'border-brand-600' : 'border-slate-300'
                        }`}
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-slate-900">
                          {option.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                          {option.description}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
