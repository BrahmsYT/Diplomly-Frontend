import { forwardRef, useEffect, useRef, useState } from 'react';
import { CertificateTemplate } from './CertificateTemplate';
import type { Certificate, PublicCertificate } from '../types';

/**
 * Sertifikat şablonunu konteynerin eninə uyğun kiçildib göstərir.
 *
 * Nə üçün ayrıca komponent:
 * `transform: scale()` elementin **layout qutusunu kiçiltmir**. Şablon 1000×707
 * pikseldir, ona görə sadəcə `scale-[0.4]` yazdıqda element hələ də 1000px yer
 * tutur — nəticədə mobil ekranda sertifikat sağa çıxır, altında isə ~400px boş
 * sahə qalır. Desktopda da sağ kənar kəsilir.
 *
 * Həll: konteynerin real eni ölçülür, miqyas ondan hesablanır və sarğıya
 * miqyaslanmış hündürlük açıq şəkildə verilir. Beləliklə sertifikat hər ekran
 * ölçüsündə tam görünür və artıq boşluq qalmır.
 */

const TEMPLATE_WIDTH = 1000;
const TEMPLATE_HEIGHT = 707;

interface Props {
  certificate: Certificate | PublicCertificate;
  qrDataUrl?: string | null;
  organizationLogo?: string | null;
  /** Şablonun böyüdülmə həddi — geniş ekranda 1:1-dən artıq böyüməsin. */
  maxScale?: number;
}

export const CertificatePreview = forwardRef<HTMLDivElement, Props>(
  ({ certificate, qrDataUrl, organizationLogo, maxScale = 1 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(maxScale);

    useEffect(() => {
      const element = containerRef.current;
      if (!element) return;

      const update = () => {
        const width = element.clientWidth;
        if (width > 0) {
          setScale(Math.min(maxScale, width / TEMPLATE_WIDTH));
        }
      };

      update();

      // Ekran çevrildikdə və ya yan menyu açıldıqda da yenidən ölçülür.
      const observer = new ResizeObserver(update);
      observer.observe(element);
      return () => observer.disconnect();
    }, [maxScale]);

    return (
      <div ref={containerRef} className="w-full">
        <div
          className="relative mx-auto overflow-hidden"
          style={{
            width: TEMPLATE_WIDTH * scale,
            height: TEMPLATE_HEIGHT * scale,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {/* ref şablonun özünə verilir — PDF/JPG yükləmə tam ölçüdən çəkilir */}
            <CertificateTemplate
              ref={ref}
              certificate={certificate}
              qrDataUrl={qrDataUrl}
              organizationLogo={organizationLogo}
            />
          </div>
        </div>
      </div>
    );
  },
);

CertificatePreview.displayName = 'CertificatePreview';
