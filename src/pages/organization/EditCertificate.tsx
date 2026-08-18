import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, PageHeader, PageLoader, Spinner } from '../../components/ui';
import { ApiError, certificateApi, orgApi } from '../../lib/api';
import type { Certificate, Course } from '../../types';

/**
 * Verilmiş sertifikatın düzəldilməsi.
 *
 * Təşkilat ad, tarix və ya kursda səhv etdikdə sertifikatı ləğv edib yenidən
 * yaratmağa məcbur qalmır. Sertifikat kodu dəyişmir — paylaşılmış linklər və
 * QR kodlar işləməyə davam edir.
 */

/** ISO tarixi <input type="date"> formatına salır. */
const toDateInput = (iso: string | null): string => (iso ? iso.slice(0, 10) : '');

export function EditCertificate() {
  const { code = '' } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    learnerName: '',
    learnerEmail: '',
    courseId: '',
    grade: '',
    issueDate: '',
    expiryDate: '',
    additionalText: '',
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([certificateApi.detail(code), orgApi.courses()])
      .then(([cert, courseList]) => {
        if (cancelled) return;
        setCertificate(cert);
        setCourses(courseList);
        setForm({
          learnerName: cert.learnerName,
          learnerEmail: cert.learnerEmail,
          courseId: cert.courseId ?? '',
          grade: cert.grade ?? '',
          issueDate: toDateInput(cert.issueDate),
          expiryDate: toDateInput(cert.expiryDate),
          additionalText: cert.additionalText ?? '',
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

  const update =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload: Record<string, unknown> = {
        learnerName: form.learnerName.trim(),
        learnerEmail: form.learnerEmail.trim(),
        courseId: form.courseId,
        issueDate: form.issueDate,
      };

      if (form.grade) payload.grade = form.grade;
      if (form.expiryDate) payload.expiryDate = form.expiryDate;
      if (form.additionalText) payload.additionalText = form.additionalText;

      await certificateApi.update(code, payload);
      navigate(`/teskilat/sertifikatlar/${code}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Dəyişikliklər yadda saxlanıla bilmədi');
      }
    } finally {
      setSaving(false);
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

  // Ləğv edilmiş sertifikat düzəldilmir — o, artıq etibarsızdır.
  if (certificate.status === 'revoked') {
    return (
      <>
        <PageHeader title="Sertifikat düzəldilə bilməz" />
        <Alert variant="warning">
          {certificate.uniqueCode} kodlu sertifikat ləğv edilib. Ləğv edilmiş sertifikat
          düzəldilmir — tarixçə olduğu kimi qalmalıdır.
        </Alert>
        <Link to={`/teskilat/sertifikatlar/${code}`} className="btn-secondary mt-6">
          Sertifikata qayıt
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        to={`/teskilat/sertifikatlar/${code}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ← Sertifikata qayıt
      </Link>

      <PageHeader
        title="Sertifikatı düzəlt"
        description={`${certificate.uniqueCode} — kod dəyişmir, paylaşılmış linklər işləməyə davam edir.`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert>{error}</Alert>}

        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Müdavim</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="learner-name" className="label">
                Ad və soyad
              </label>
              <input
                id="learner-name"
                value={form.learnerName}
                onChange={update('learnerName')}
                className={`input ${fieldErrors.learnerName ? 'border-red-400' : ''}`}
                required
                minLength={2}
                maxLength={160}
              />
              {fieldErrors.learnerName && <p className="field-error">{fieldErrors.learnerName}</p>}
            </div>

            <div>
              <label htmlFor="learner-email" className="label">
                E-mail
              </label>
              <input
                id="learner-email"
                type="email"
                value={form.learnerEmail}
                onChange={update('learnerEmail')}
                className={`input ${fieldErrors.learnerEmail ? 'border-red-400' : ''}`}
                required
              />
              {fieldErrors.learnerEmail && <p className="field-error">{fieldErrors.learnerEmail}</p>}
              <p className="mt-1.5 text-xs text-slate-500">
                E-mail dəyişdirilərsə sertifikat yeni sahibin hesabına bağlanır və təsdiq yenidən
                gözlənilir.
              </p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Kurs</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="course" className="label">
                Kurs / proqram
              </label>
              <select
                id="course"
                value={form.courseId}
                onChange={update('courseId')}
                className="input"
                required
              >
                <option value="">Kurs seçin...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              {fieldErrors.courseId && <p className="field-error">{fieldErrors.courseId}</p>}
            </div>

            <div>
              <label htmlFor="grade" className="label">
                Qiymət / nəticə
                <span className="ml-1 font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="grade"
                value={form.grade}
                onChange={update('grade')}
                className="input"
                maxLength={60}
                placeholder="92 və ya Əla"
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Tarixlər</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="issue-date" className="label">
                  Verilmə tarixi
                </label>
                <input
                  id="issue-date"
                  type="date"
                  value={form.issueDate}
                  onChange={update('issueDate')}
                  className="input"
                  required
                />
                {fieldErrors.issueDate && <p className="field-error">{fieldErrors.issueDate}</p>}
              </div>
              <div>
                <label htmlFor="expiry-date" className="label">
                  Bitmə tarixi
                  <span className="ml-1 font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="expiry-date"
                  type="date"
                  value={form.expiryDate}
                  onChange={update('expiryDate')}
                  min={form.issueDate || undefined}
                  className="input"
                />
                {fieldErrors.expiryDate && <p className="field-error">{fieldErrors.expiryDate}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="additional" className="label">
                Əlavə mətn
                <span className="ml-1 font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="additional"
                value={form.additionalText}
                onChange={update('additionalText')}
                className="input min-h-[80px] resize-y"
                maxLength={500}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving && <Spinner className="h-4 w-4" />}
            Dəyişiklikləri yadda saxla
          </button>
          <Link to={`/teskilat/sertifikatlar/${code}`} className="btn-secondary">
            İmtina
          </Link>
        </div>
      </form>
    </>
  );
}
