import { useEffect, useState } from 'react';
import { AccountSettings } from '../../components/AccountSettings';
import { Alert, PageHeader, PageLoader, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError, orgApi } from '../../lib/api';
import type { Organization } from '../../types';

/** Bölmə 8 — təşkilat menyusundakı "Təşkilat məlumatları" səhifəsi. */
export function OrgProfile() {
  const { refresh } = useAuth();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: '',
    logo: '',
    website: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    headName: '',
  });

  useEffect(() => {
    orgApi
      .me()
      .then((data) => {
        setOrganization(data);
        setForm({
          name: data.name,
          logo: data.logo ?? '',
          website: data.website ?? '',
          email: data.email,
          phone: data.phone ?? '',
          country: data.country ?? '',
          city: data.city ?? '',
          headName: data.headName ?? '',
        });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Təşkilat məlumatları yüklənmədi'))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      setOrganization(await orgApi.update(form));
      setSaved(true);
      // Yan menyudakı təşkilat adı da yenilənsin deyə sessiyanı təzələyirik.
      await refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Məlumatlar yadda saxlanıla bilmədi');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Təşkilat məlumatları"
        description={
          organization
            ? `${organization.certificateCount} sertifikat · ${organization.courseCount} kurs`
            : undefined
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert>{error}</Alert>}
        {saved && <Alert variant="success">Məlumatlar yadda saxlanıldı.</Alert>}

        <section className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Ümumi məlumatlar</h2>
          <div className="space-y-4">
            <Field
              label="Təşkilatın adı"
              value={form.name}
              onChange={update('name')}
              error={fieldErrors.name}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ölkə" value={form.country} onChange={update('country')} />
              <Field label="Şəhər" value={form.city} onChange={update('city')} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="E-mail"
                type="email"
                value={form.email}
                onChange={update('email')}
                error={fieldErrors.email}
              />
              <Field label="Telefon" value={form.phone} onChange={update('phone')} />
            </div>

            <Field
              label="Vebsayt"
              value={form.website}
              onChange={update('website')}
              error={fieldErrors.website}
              placeholder="https://example.az"
            />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Sertifikat görünüşü</h2>
          <p className="mb-4 text-sm text-slate-500">
            Bu məlumatlar verdiyiniz hər sertifikatın üzərində göstərilir.
          </p>

          <div className="space-y-4">
            <Field
              label="Loqonun URL-i"
              value={form.logo}
              onChange={update('logo')}
              error={fieldErrors.logo}
              placeholder="https://example.az/logo.png"
            />

            {form.logo && (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <img
                  src={form.logo}
                  alt="Loqo"
                  className="h-10 max-w-[140px] object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xs text-slate-500">Sertifikatdakı görünüş</span>
              </div>
            )}

            <Field
              label="Rəhbərin adı"
              value={form.headName}
              onChange={update('headName')}
              placeholder="Rəşad Məmmədov"
              hint="Sertifikatın imza sahəsində göstərilir."
            />
          </div>
        </section>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Spinner className="h-4 w-4" />}
          Yadda saxla
        </button>
      </form>

      {/* Hesab sahibinin şəxsi məlumatları və şifrəsi — təşkilat məlumatlarından ayrıdır. */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Hesab sahibi</h2>
        <AccountSettings />
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  error,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}) {
  const id = `org-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${error ? 'border-red-300' : ''}`}
      />
      {error ? (
        <p className="field-error">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
