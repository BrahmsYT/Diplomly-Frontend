import { DetailRow, PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

/** Bölmə 8 — müdavim menyusundakı "Profil" səhifəsi. */
export function LearnerProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageHeader title="Profil" description="Hesab məlumatlarınız." />

      <section className="card p-6">
        <dl>
          <DetailRow label="Ad" value={user.name} />
          <DetailRow label="Soyad" value={user.surname} />
          <DetailRow label="E-mail" value={user.email} />
          <DetailRow label="Hesab növü" value="Müdavim / Məzun" />
        </dl>
      </section>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-900">E-mail ünvanınız niyə vacibdir?</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Təşkilatlar sertifikat yaradarkən məhz bu ünvanı daxil edir. Sertifikat verildikdə sistem
          onu avtomatik olaraq bu hesaba bağlayır — əlavə heç nə etmək lazım deyil.
        </p>
      </div>
    </>
  );
}
