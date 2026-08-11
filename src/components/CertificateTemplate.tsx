import { forwardRef } from 'react';
import { formatDateLong } from '../lib/format';
import type { Certificate, PublicCertificate } from '../types';

/**
 * Bölmə 4.9 — MVP-nin standart Diplomly sertifikat şablonu.
 *
 * Şablonda tələb olunan elementlər: Diplomly loqosu, təşkilatın loqosu,
 * müdavimin adı, kurs adı, verilmə tarixi, sertifikat kodu, QR kod,
 * rəhbərin adı və imza sahəsi.
 *
 * DİQQƏT: burada Tailwind sinifləri deyil, inline stillər istifadə olunur.
 * html2canvas (PDF/JPG yükləmə) xarici CSS sinifləri və müasir rəng
 * funksiyalarını həmişə düzgün oxumur — inline heks rənglər ilə yüklənən
 * fayl ekrandakı ilə eyni çıxır.
 */

interface Props {
  certificate: Certificate | PublicCertificate;
  qrDataUrl?: string | null;
  organizationLogo?: string | null;
}

const GOLD = '#b08d3f';
const INK = '#111c33';
const MUTED = '#64748b';

export const CertificateTemplate = forwardRef<HTMLDivElement, Props>(
  ({ certificate, qrDataUrl, organizationLogo }, ref) => {
    const isRevoked = certificate.status === 'revoked';

    return (
      <div
        ref={ref}
        style={{
          width: 1000,
          height: 707,
          position: 'relative',
          backgroundColor: '#ffffff',
          fontFamily: 'Georgia, Cambria, serif',
          color: INK,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Kənar haşiyə */}
        <div
          style={{
            position: 'absolute',
            inset: 18,
            border: `2px solid ${GOLD}`,
            boxSizing: 'border-box',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 26,
            border: `1px solid ${GOLD}55`,
            boxSizing: 'border-box',
          }}
        />

        {/* Dekorativ künc ləkələri */}
        <div
          style={{
            position: 'absolute',
            top: -90,
            right: -90,
            width: 260,
            height: 260,
            borderRadius: '50%',
            backgroundColor: '#eef2ff',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -110,
            left: -70,
            width: 240,
            height: 240,
            borderRadius: '50%',
            backgroundColor: '#f5f0e4',
            opacity: 0.8,
          }}
        />

        {/* Ləğv edilmiş sertifikat üçün su nişanı (bölmə 4.8) */}
        {isRevoked && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-24deg)',
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: 8,
              color: '#dc2626',
              opacity: 0.12,
              whiteSpace: 'nowrap',
              zIndex: 5,
            }}
          >
            LƏĞV EDİLİB
          </div>
        )}

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '54px 70px 46px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {/* Başlıq: Diplomly loqosu + təşkilatın loqosu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 26,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  fontWeight: 700,
                  fontFamily: 'Inter, Segoe UI, sans-serif',
                }}
              >
                D
              </div>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  fontFamily: 'Inter, Segoe UI, sans-serif',
                }}
              >
                Diplomly
              </span>
            </div>

            {organizationLogo ? (
              <img
                src={organizationLogo}
                alt=""
                crossOrigin="anonymous"
                style={{ maxHeight: 46, maxWidth: 190, objectFit: 'contain' }}
              />
            ) : (
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: MUTED,
                  fontFamily: 'Inter, Segoe UI, sans-serif',
                }}
              >
                {certificate.organizationName}
              </span>
            )}
          </div>

          {/* Əsas hissə */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p
              style={{
                fontSize: 13,
                letterSpacing: 5,
                textTransform: 'uppercase',
                color: GOLD,
                fontWeight: 600,
                margin: '0 0 6px',
                fontFamily: 'Inter, Segoe UI, sans-serif',
              }}
            >
              Sertifikat
            </p>

            <h1 style={{ fontSize: 38, fontWeight: 400, margin: '0 0 26px', letterSpacing: 1 }}>
              Təltif olunur
            </h1>

            {/* Müdavimin adı */}
            <p
              style={{
                fontSize: 48,
                fontWeight: 700,
                margin: '0 0 8px',
                lineHeight: 1.15,
                color: INK,
              }}
            >
              {certificate.learnerName}
            </p>

            <div
              style={{
                width: 220,
                height: 2,
                backgroundColor: GOLD,
                margin: '0 auto 24px',
              }}
            />

            <p
              style={{
                fontSize: 15,
                color: MUTED,
                margin: '0 0 10px',
                fontFamily: 'Inter, Segoe UI, sans-serif',
              }}
            >
              aşağıdakı təlim proqramını uğurla başa vurduğu üçün
            </p>

            {/* Kurs adı */}
            <p style={{ fontSize: 26, fontWeight: 700, margin: '0 0 14px', color: '#312e81' }}>
              {certificate.courseName}
            </p>

            {/* Qiymət / nəticə — varsa */}
            {certificate.grade && (
              <p
                style={{
                  fontSize: 14,
                  color: MUTED,
                  margin: '0 0 6px',
                  fontFamily: 'Inter, Segoe UI, sans-serif',
                }}
              >
                Nəticə: <strong style={{ color: INK }}>{certificate.grade}</strong>
              </p>
            )}

            {certificate.additionalText && (
              <p
                style={{
                  fontSize: 13,
                  color: MUTED,
                  margin: '4px auto 0',
                  maxWidth: 560,
                  fontFamily: 'Inter, Segoe UI, sans-serif',
                }}
              >
                {certificate.additionalText}
              </p>
            )}
          </div>

          {/* Alt hissə: QR + kod, tarix, imza */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: 20,
              fontFamily: 'Inter, Segoe UI, sans-serif',
            }}
          >
            {/* QR kod və sertifikat kodu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 250 }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR kod" style={{ width: 74, height: 74 }} />
              ) : (
                <div
                  style={{
                    width: 74,
                    height: 74,
                    border: '1px dashed #cbd5e1',
                    borderRadius: 4,
                  }}
                />
              )}
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 10, color: MUTED, margin: '0 0 2px' }}>Sertifikat kodu</p>
                <p style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>
                  {certificate.uniqueCode}
                </p>
                <p style={{ fontSize: 9.5, color: MUTED, margin: '3px 0 0' }}>
                  diplomly.com/certificate
                </p>
              </div>
            </div>

            {/* Verilmə tarixi */}
            <div style={{ textAlign: 'center', width: 220 }}>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 7 }}>
                <p style={{ fontSize: 10, color: MUTED, margin: '0 0 2px' }}>Verilmə tarixi</p>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                  {formatDateLong(certificate.issueDate)}
                </p>
                {certificate.expiryDate && (
                  <p style={{ fontSize: 10, color: MUTED, margin: '3px 0 0' }}>
                    Bitmə: {formatDateLong(certificate.expiryDate)}
                  </p>
                )}
              </div>
            </div>

            {/* İmza sahəsi + rəhbərin adı */}
            <div style={{ textAlign: 'center', width: 250 }}>
              <p
                style={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: '#334155',
                  margin: '0 0 2px',
                  height: 26,
                }}
              >
                {certificate.headName ?? ''}
              </p>
              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 7 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
                  {certificate.headName ?? '—'}
                </p>
                <p style={{ fontSize: 10, color: MUTED, margin: '2px 0 0' }}>
                  {certificate.organizationName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CertificateTemplate.displayName = 'CertificateTemplate';
