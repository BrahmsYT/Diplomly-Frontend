import { AccountSettings } from '../../components/AccountSettings';
import { PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

/** Bölmə 8 — müdavim menyusundakı "Profil" səhifəsi. */
export function LearnerProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <PageHeader title="Profil" description="Hesab məlumatlarınız və təhlükəsizlik ayarları." />

      <AccountSettings />

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
