import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Logo, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError, authApi } from '../../lib/api';

/** Qeydiyyat növünün seçilməsi. */
export function RegisterChoice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <Logo className="mx-auto h-11 w-11" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Qeydiyyatdan keçin</h1>
        <p className="mt-1.5 text-slate-500">Hansı tərəf kimi qeydiyyatdan keçirsiniz?</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link to="/qeydiyyat/mudavim" className="card p-6 transition-shadow hover:shadow-lift">
          <div className="text-3xl" aria-hidden="true">
            🎓
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Müdavim / Məzun</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Aldığınız bütün sertifikatları bir hesabda toplayın, paylaşın və yükləyin.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-brand-600">Davam et →</span>
        </Link>

        <Link to="/qeydiyyat/teskilat" className="card p-6 transition-shadow hover:shadow-lift">
          <div className="text-3xl" aria-hidden="true">
            🏛️
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Şirkət / Təlim təşkilatı</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Sertifikat yaradın, idarə edin və verdiyiniz sənədlərin həqiqiliyini təmin edin.
          </p>
          <span className="mt-4 inline-block text-sm font-medium text-brand-600">Davam et →</span>
        </Link>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Artıq hesabınız var?{' '}
        <Link to="/daxil-ol" className="font-medium text-brand-600 hover:text-brand-700">
          Daxil olun
        </Link>
      </p>
    </div>
  );
}

/** Bölmə 3.1 — müdavim qeydiyyatı. */
export function RegisterLearner() {
  const { applyAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const payload = await authApi.registerLearner(form);
      applyAuth(payload);
      navigate('/panel', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Qeydiyyat zamanı xəta baş verdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <Logo className="mx-auto h-11 w-11" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Müdavim qeydiyyatı</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Bu e-mail ünvanına əvvəlcədən verilmiş sertifikatlar hesabınıza avtomatik bağlanacaq.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && <Alert>{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Ad"
            value={form.name}
            onChange={update('name')}
            error={fieldErrors.name}
            autoComplete="given-name"
          />
          <Field
            label="Soyad"
            value={form.surname}
            onChange={update('surname')}
            error={fieldErrors.surname}
            autoComplete="family-name"
          />
        </div>

        <Field
          label="E-mail"
          type="email"
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email}
          autoComplete="email"
          hint="Təşkilatlar sertifikat verərkən məhz bu ünvanı daxil edir."
        />

        <Field
          label="Şifrə"
          type="password"
          value={form.password}
          onChange={update('password')}
          error={fieldErrors.password}
          autoComplete="new-password"
          hint="Ən azı 6 simvol."
        />

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />}
          Qeydiyyatdan keç
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Təşkilatsınız?{' '}
        <Link to="/qeydiyyat/teskilat" className="font-medium text-brand-600 hover:text-brand-700">
          Təşkilat qeydiyyatı
        </Link>
      </p>
    </div>
  );
}

/** Bölmə 4.1 — təşkilat qeydiyyatı. */
export function RegisterOrganization() {
  const { applyAuth } = useAuth();
  const navigate = useNavigate();

  const [org, setOrg] = useState({
    name: '',
    country: 'Azərbaycan',
    city: '',
    website: '',
    email: '',
    phone: '',
    logo: '',
  });
  const [owner, setOwner] = useState({
    name: '',
    surname: '',
    position: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateOrg = (key: keyof typeof org) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setOrg((prev) => ({ ...prev, [key]: event.target.value }));

  const updateOwner = (key: keyof typeof owner) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setOwner((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const payload = await authApi.registerOrganization({ organization: org, owner });
      applyAuth(payload);
      navigate('/teskilat', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Qeydiyyat zamanı xəta baş verdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <Logo className="mx-auto h-11 w-11" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Təşkilat qeydiyyatı</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Təlim mərkəzi, universitet, akademiya və ya şirkətin daxili akademiyası.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert>{error}</Alert>}

        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Şirkət məlumatları</h2>
          <div className="space-y-4">
            <Field
              label="Təşkilatın adı"
              value={org.name}
              onChange={updateOrg('name')}
              error={fieldErrors['organization.name']}
              placeholder="ABC Academy"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ölkə" value={org.country} onChange={updateOrg('country')} />
              <Field label="Şəhər" value={org.city} onChange={updateOrg('city')} placeholder="Bakı" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="E-mail"
                type="email"
                value={org.email}
                onChange={updateOrg('email')}
                error={fieldErrors['organization.email']}
                placeholder="info@abcacademy.az"
              />
              <Field
                label="Telefon"
                value={org.phone}
                onChange={updateOrg('phone')}
                required={false}
                placeholder="+994 12 345 67 89"
              />
            </div>

            <Field
              label="Vebsayt"
              value={org.website}
              onChange={updateOrg('website')}
              error={fieldErrors['organization.website']}
              required={false}
              placeholder="https://abcacademy.az"
            />

            <Field
              label="Loqonun URL-i"
              value={org.logo}
              onChange={updateOrg('logo')}
              error={fieldErrors['organization.logo']}
              required={false}
              placeholder="https://abcacademy.az/logo.png"
              hint="Sertifikatın üzərində göstərilir. Sonradan da əlavə edə bilərsiniz."
            />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Hesab sahibi</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Ad"
                value={owner.name}
                onChange={updateOwner('name')}
                error={fieldErrors['owner.name']}
              />
              <Field
                label="Soyad"
                value={owner.surname}
                onChange={updateOwner('surname')}
                error={fieldErrors['owner.surname']}
              />
            </div>

            <Field
              label="Vəzifə"
              value={owner.position}
              onChange={updateOwner('position')}
              required={false}
              placeholder="Direktor"
            />

            <Field
              label="E-mail"
              type="email"
              value={owner.email}
              onChange={updateOwner('email')}
              error={fieldErrors['owner.email']}
              hint="Sistemə giriş üçün istifadə olunacaq."
            />

            <Field
              label="Şifrə"
              type="password"
              value={owner.password}
              onChange={updateOwner('password')}
              error={fieldErrors['owner.password']}
              autoComplete="new-password"
              hint="Ən azı 6 simvol."
            />
          </div>

          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Hesab sahibinin ad və soyadı sertifikatlarda «rəhbərin adı» kimi göstəriləcək. Bunu
            sonradan təşkilat məlumatları bölməsindən dəyişə bilərsiniz.
          </p>
        </section>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />}
          Təşkilatı qeydiyyatdan keçir
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Müdavimsiniz?{' '}
        <Link to="/qeydiyyat/mudavim" className="font-medium text-brand-600 hover:text-brand-700">
          Müdavim qeydiyyatı
        </Link>
      </p>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  error,
  hint,
  placeholder,
  required = true,
  autoComplete,
}: FieldProps) {
  const id = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {!required && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      {error ? (
        <p className="field-error">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
