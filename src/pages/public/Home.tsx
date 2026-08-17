import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicApi } from '../../lib/api';

/** Bölmə 5 — ana səhifədə böyük axtarış hissəsi. */
export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState<{ certificates: number; organizations: number } | null>(null);

  useEffect(() => {
    publicApi.stats().then(setStats).catch(() => setStats(null));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/yoxla?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <>
      {/* Hero + axtarış */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <p className="eyebrow justify-center">Sertifikatların vahid reyestri</p>

          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Sertifikatı yoxla
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Sertifikat kodunu və ya e-mail ünvanını daxil edərək sənədin həqiqiliyini bir neçə
            saniyəyə təsdiqləyin. Bunun üçün hesab yaratmağa ehtiyac yoxdur.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sertifikat kodunu və ya e-mail ünvanını daxil edin"
                className="input flex-1 py-3 text-base"
                aria-label="Sertifikat kodu və ya e-mail"
              />
              <button type="submit" className="btn-primary py-3 sm:px-8">
                Yoxla
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Nümunə: <code className="font-mono text-brand-800">DPL-000001</code> və ya{' '}
              <code className="font-mono text-brand-800">saleh@example.com</code>
            </p>
          </form>

          {stats && (
            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-slate-500">
              <div>
                <span className="font-display block text-2xl font-semibold text-slate-900">
                  {stats.certificates.toLocaleString('az-AZ')}
                </span>
                sertifikat
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="font-display block text-2xl font-semibold text-slate-900">
                  {stats.organizations.toLocaleString('az-AZ')}
                </span>
                təşkilat
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Üç tərəf — bölmə 10 */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="font-display text-center text-2xl font-semibold text-slate-900">
            Sistem üç tərəf üzərində qurulub
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
            Təşkilat sertifikat verir → Müdavim sertifikatı hesabında görür → Üçüncü şəxs
            sertifikatı yoxlayır.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                role: 'Issuer',
                title: 'Sertifikatı verən',
                text: 'Təşkilat bir formda sertifikat yaradır. Sistem unikal DPL kodu və QR kodu özü verir.',
              },
              {
                role: 'Learner',
                title: 'Sertifikatı alan',
                text: 'Müdavim müxtəlif təşkilatlardan aldığı bütün sertifikatları tək hesabda görür və paylaşır.',
              },
              {
                role: 'Verifier',
                title: 'Sertifikatı yoxlayan',
                text: 'HR və ya digər yoxlayan şəxs təşkilata müraciət etmədən həqiqiliyi dərhal təsdiqləyir.',
              },
            ].map((item, index) => (
              <div key={item.role} className="border-t-2 border-brand-700 pt-4">
                <p className="font-display text-3xl text-slate-300">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-700">
                  {item.role}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            Təşkilatınız sertifikat verir?
          </h2>
          <p className="max-w-xl text-slate-600">
            Verdiyiniz bütün sertifikatları vahid sistemdə idarə edin, saxtakarlığın qarşısını alın
            və müdavimlərinizə yoxlanıla bilən sənəd verin.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/qeydiyyat/teskilat" className="btn-primary">
              Təşkilat kimi qeydiyyat
            </Link>
            <Link to="/teskilatlar-ucun" className="btn-secondary">
              Ətraflı məlumat
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
