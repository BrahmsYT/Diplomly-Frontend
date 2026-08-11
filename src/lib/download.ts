/**
 * Bölmə 3.7 — sertifikatın PDF və JPG formatında yüklənməsi.
 *
 * Sertifikat şablonu React komponenti kimi çəkilir, sonra html2canvas ilə
 * kətana (canvas) köçürülür. Beləliklə yüklənən fayl ekranda görünənlə
 * eyni olur və serverdə ayrıca PDF generatoruna ehtiyac qalmır.
 *
 * html2canvas və jsPDF birlikdə ~600 kB-dır və yalnız istifadəçi yükləmə
 * düyməsinə basdıqda lazım olur — ona görə dinamik import ilə gətirilir və
 * əsas bundle-a düşmür.
 */

const SCALE = 2; // 2x — çap üçün kifayət qədər aydın

async function renderToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas');

  return html2canvas(element, {
    scale: SCALE,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
}

function triggerDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadAsJpg(element: HTMLElement, code: string): Promise<void> {
  const canvas = await renderToCanvas(element);
  triggerDownload(canvas.toDataURL('image/jpeg', 0.95), `${code}.jpg`);
}

export async function downloadAsPdf(element: HTMLElement, code: string): Promise<void> {
  const [canvas, { jsPDF }] = await Promise.all([renderToCanvas(element), import('jspdf')]);
  const imageData = canvas.toDataURL('image/jpeg', 0.95);

  // Sertifikat şablonu landscape nisbətindədir — A4 landscape-ə tam oturur.
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Şəkli nisbətini saxlayaraq səhifəyə sığdırırıq və mərkəzləşdiririk.
  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  const x = (pageWidth - width) / 2;
  const y = (pageHeight - height) / 2;

  pdf.addImage(imageData, 'JPEG', x, y, width, height);
  pdf.save(`${code}.pdf`);
}

/** Bölmə 3.6 — paylaşma linkini panoya kopyalayır. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // HTTPS olmayan mühitlərdə clipboard API bloklana bilər — ehtiyat yol.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }
}
