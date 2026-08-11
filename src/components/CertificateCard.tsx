import { Link } from 'react-router-dom';
import { formatDate } from '../lib/format';
import type { Certificate } from '../types';
import { AcceptanceBadge, StatusBadge } from './ui';

/**
 * Bölmə 3.3 — müdavimin "Sertifikatlarım" bölməsindəki kart görünüşü.
 * Hər kartda: sertifikatın/kursun adı, verən təşkilat, verilmə və bitmə
 * tarixi, sertifikat kodu və status göstərilir.
 */
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <Link
      to={`/panel/sertifikatlar/${certificate.uniqueCode}`}
      className="card group flex flex-col p-5 transition-shadow hover:shadow-lift"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={certificate.status} label={certificate.statusLabel} />
          <AcceptanceBadge acceptance={certificate.acceptance} />
        </div>
        {certificate.visibility === 'only_me' && (
          <span
            className="text-slate-400"
            title="Yalnız mən görə bilərəm — ümumi axtarışda görünmür"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
        {certificate.courseName}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{certificate.organizationName}</p>

      <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Verilmə tarixi</dt>
          <dd className="font-medium text-slate-700">{formatDate(certificate.issueDate)}</dd>
        </div>
        {certificate.expiryDate && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Bitmə tarixi</dt>
            <dd className="font-medium text-slate-700">{formatDate(certificate.expiryDate)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-slate-500">Kod</dt>
          <dd className="font-mono text-xs font-semibold text-brand-700">
            {certificate.uniqueCode}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
