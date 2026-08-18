import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, PageHeader, Spinner } from '../../components/ui';
import { ApiError, certificateApi, orgApi } from '../../lib/api';
import { toDateInputValue } from '../../lib/format';
import type { Certificate, Course, LearnerLookup } from '../../types';

/**
 * Bölmə 4.5 — yeni sertifikat yaratma formu.
 *
 * İki xüsusi qeyd bu səhifədə həyata keçirilir:
 *  1. Təşkilat müdavimin e-mailini daxil etdikdə ad/soyad avtomatik çıxır —
 *     təşkilat onu əl ilə yazmır.
 *  2. Kurs adı sərbəst yazılmır, əvvəlcədən yaradılmış siyahıdan seçilir ki,
 *     hərf və yazılış fərqləri olmasın.
 */
export function NewCertificate() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [lookup, setLookup] = useState<LearnerLookup | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [form, setForm] = useState({
    learnerName: '',
    learnerSurname: '',
    courseId: '',
    newCourseName: '',
    grade: '',
    issueDate: toDateInputValue(),
    expiryDate: '',
    additionalText: '',
  });

  const [useNewCourse, setUseNewCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Certificate | null>(null);

  useEffect(() => {
    orgApi
      .courses()
      .then((data) => {
        setCourses(data);
        // Kataloq boşdursa dərhal yeni kurs yazma rejiminə keçirik.
        if (data.length === 0) setUseNewCourse(true);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Kurs siyahısı yüklənmədi'))
      .finally(() => setCoursesLoading(false));
  }, []);

  // E-mail yazıldıqca müdavimi axtarırıq (bölmə 4.5 xüsusi qeydi).
  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setLookup(null);
      return;
    }

    const timer = setTimeout(() => {
      setLookupLoading(true);
      certificateApi
        .lookupLearner(trimmed)
        .then((data) => {
          setLookup(data);
          if (data.found) {
            // Ad/soyad sistemdən gəlir — təşkilat onu yazmır.
            setForm((prev) => ({
              ...prev,
              learnerName: data.name ?? '',
              learnerSurname: data.surname ?? '',
            }));
          }
        })
        .catch(() => setLookup(null))
        .finally(() => setLookupLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  const update =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        learnerEmail: email.trim(),
        issueDate: form.issueDate,
      };

      if (!lookup?.found) {
        payload.learnerName = form.learnerName;
        payload.learnerSurname = form.learnerSurname;
      }

      if (useNewCourse) {
        payload.courseName = form.newCourseName;
      } else {
        payload.courseId = form.courseId;
      }

      if (form.grade) payload.grade = form.grade;
      if (form.expiryDate) payload.expiryDate = form.expiryDate;
      if (form.additionalText) payload.additionalText = form.additionalText;

      setCreated(await certificateApi.create(payload));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Sertifikat yaradıla bilmədi');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Uğurlu nəticə ekranı ---
  if (created) {
    return (
      <>
        <PageHeader title="Sertifikat yaradıldı" />

        <div className="card p-6">
          <div className="mb-6 flex items-center gap-3 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-6 w-6 shrink-0 text-emerald-700"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5l2.2 2.2L15.5 10" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <div>
              <p className="font-medium text-emerald-900">
                {created.learnerName} üçün sertifikat hazırdır
              </p>
              <p className="text-sm text-emerald-800">
                Sistem avtomatik unikal kod verdi — əl ilə yazmağa ehtiyac yoxdur.
              </p>
            </div>
          </div>

          <dl className="space-y-3">
            <Row label="Sertifikat kodu">
              <span className="font-mono text-base font-semibold text-brand-700">
                {created.uniqueCode}
              </span>
            </Row>
            <Row label="Müdavim">{created.learnerName}</Row>
            <Row label="E-mail">{created.learnerEmail}</Row>
            <Row label="Kurs">{created.courseName}</Row>
            <Row label="Public link">
              <a
                href={created.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-brand-600 hover:text-brand-700"
              >
                {created.publicUrl}
              </a>
            </Row>
          </dl>

          {!created.isClaimed && (
            <div className="mt-5">
              <Alert variant="info">
                Bu müdavim hələ Diplomly-də qeydiyyatdan keçməyib. O, həmin e-mail ilə qeydiyyatdan
                keçdikdə sertifikat avtomatik hesabına bağlanacaq.
              </Alert>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/teskilat/sertifikatlar/${created.uniqueCode}`}
              className="btn-primary"
            >
              Sertifikata bax
            </Link>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                // Ardıcıl sertifikat vermək üçün formu təmizləyirik.
                setCreated(null);
                setEmail('');
                setLookup(null);
                setForm((prev) => ({
                  ...prev,
                  learnerName: '',
                  learnerSurname: '',
                  grade: '',
                  additionalText: '',
                }));
              }}
            >
              Daha bir sertifikat yarat
            </button>
            <Link to="/teskilat/sertifikatlar" className="btn-secondary">
              Siyahıya qayıt
            </Link>
          </div>
        </div>
      </>
    );
  }

  const showManualName = email.trim().includes('@') && !lookupLoading && lookup?.found === false;

  return (
    <>
      <PageHeader
        title="Yeni sertifikat yarat"
        description="Sertifikat kodu sistem tərəfindən avtomatik veriləcək."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert>{error}</Alert>}

        {/* Müdavim məlumatları */}
        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Müdavim məlumatları</h2>

          <div>
            <label htmlFor="learner-email" className="label">
              Müdavimin e-mail ünvanı
            </label>
            <div className="relative">
              <input
                id="learner-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input pr-10"
                placeholder="ad@example.com"
                required
                autoComplete="off"
              />
              {lookupLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Spinner className="h-4 w-4" />
                </span>
              )}
            </div>

            {fieldErrors.learnerEmail && <p className="field-error">{fieldErrors.learnerEmail}</p>}

            {/* Bölmə 4.5: e-mail tanındıqda ad/soyad avtomatik gəlir */}
            {lookup?.found && (
              <div className="mt-3 flex items-center gap-3 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5 shrink-0 text-emerald-700"
                >
                  <circle cx="12" cy="8" r="3.2" />
                  <path strokeLinecap="round" d="M5.5 20c0-3.6 2.9-6.2 6.5-6.2s6.5 2.6 6.5 6.2" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-emerald-900">
                    {lookup.name} {lookup.surname}
                  </p>
                  <p className="text-emerald-800">
                    {lookup.source === 'user'
                      ? 'Sistemdə qeydiyyatdan keçib — ad avtomatik dolduruldu.'
                      : 'Əvvəlki sertifikatdan tapıldı — ad avtomatik dolduruldu.'}
                  </p>
                </div>
              </div>
            )}

            {showManualName && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Bu e-mail sistemdə tanınmır. Müdavimin ad və soyadını daxil edin.
              </div>
            )}
          </div>

          {/* Ad/soyad yalnız tanınmayan müdavim üçün yazılır */}
          {showManualName && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="learner-name" className="label">
                  Ad
                </label>
                <input
                  id="learner-name"
                  value={form.learnerName}
                  onChange={update('learnerName')}
                  className="input"
                  required
                  minLength={2}
                  maxLength={80}
                />
                {fieldErrors.learnerName && <p className="field-error">{fieldErrors.learnerName}</p>}
              </div>
              <div>
                <label htmlFor="learner-surname" className="label">
                  Soyad
                </label>
                <input
                  id="learner-surname"
                  value={form.learnerSurname}
                  onChange={update('learnerSurname')}
                  className="input"
                  required
                  minLength={2}
                  maxLength={80}
                />
                {fieldErrors.learnerSurname && (
                  <p className="field-error">{fieldErrors.learnerSurname}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Kurs məlumatları */}
        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Kurs məlumatları</h2>

          {coursesLoading ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-5 w-5 text-brand-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {!useNewCourse ? (
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
                  <p className="mt-1.5 text-xs text-slate-500">
                    Kurs adı siyahıdan seçilir ki, yazılış fərqləri olmasın.
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="new-course" className="label">
                    Yeni kursun adı
                  </label>
                  <input
                    id="new-course"
                    value={form.newCourseName}
                    onChange={update('newCourseName')}
                    className="input"
                    placeholder="Project Management Fundamentals"
                    required
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Bu kurs kataloqunuza da əlavə olunacaq və sonrakı sertifikatlarda siyahıda
                    görünəcək.
                  </p>
                </div>
              )}

              {courses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNewCourse((prev) => !prev)}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {useNewCourse ? '← Kataloqdan seç' : '+ Kataloqda olmayan kurs yaz'}
                </button>
              )}

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
                  placeholder="92 və ya Əla"
                />
              </div>
            </div>
          )}
        </section>

        {/* Sertifikat məlumatları */}
        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Sertifikat məlumatları</h2>

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
                <p className="mt-1.5 text-xs text-slate-500">Boş buraxsanız sertifikat müddətsiz olur.</p>
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
                placeholder="40 saatlıq təlim proqramı"
                maxLength={500}
              />
            </div>
          </div>

          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Təşkilatın adı, loqosu və rəhbərin adı sertifikata avtomatik əlavə olunur.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4" />}
            Sertifikatı yarat
          </button>
          <Link to="/teskilat/sertifikatlar" className="btn-secondary">
            Ləğv et
          </Link>
        </div>
      </form>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 sm:text-right">{children}</dd>
    </div>
  );
}
