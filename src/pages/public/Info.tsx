import { Link } from 'react-router-dom';

/** Bölmə 8 — "Diplomly haqqında" səhifəsi. */
export function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
        Diplomly haqqında
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        Diplomly — təlim, kurs, seminar, akademiya və digər təhsil proqramları tərəfindən verilən
        sertifikatların vahid sistemdə yaradılması, saxlanılması və yoxlanılması üçün platformadır.
      </p>

      <h2 className="font-display mt-10 text-xl font-semibold text-slate-900">
        Həll etdiyimiz problem
      </h2>
      <ul className="mt-4 space-y-3 border-t border-slate-200 pt-4">
        {[
          'Sertifikatların saxta olub-olmadığını yoxlamaq çətindir.',
          'İnsanların müxtəlif təşkilatlardan aldığı sertifikatlar fərqli yerlərdə saxlanılır.',
          'HR və digər yoxlayan şəxslər sertifikatın həqiqiliyini birbaşa təşkilatdan soruşmalı olur.',
          'Sertifikat verən təşkilatların verdikləri sertifikatları idarə etmək üçün vahid sistemi olmaya bilər.',
        ].map((item) => (
          <li key={item} className="flex gap-3 text-slate-600">
            <span className="mt-2 h-1 w-1 shrink-0 bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-10 text-xl font-semibold text-slate-900">Necə işləyir</h2>
      <ol className="mt-4 space-y-4 border-t border-slate-200 pt-4">
        {[
          'Təşkilat qeydiyyatdan keçir və sistemə daxil olur.',
          'Təşkilat yeni sertifikat yaradır — kurs kataloqdan seçilir, müdavim e-mail ilə tapılır.',
          'Sistem avtomatik unikal DPL kodu verir (məsələn DPL-000245).',
          'Sertifikat üçün unikal public URL və QR kod yaranır.',
          'Müdavim qeydiyyatdan keçdikdə sertifikatı hesabında görür və təsdiqləyir.',
          'HR və ya başqa şəxs kodu Diplomly-də yoxlayaraq həqiqiliyi təsdiqləyir.',
        ].map((step, index) => (
          <li key={step} className="flex gap-4">
            <span className="font-display flex h-7 w-7 shrink-0 items-center justify-center border border-brand-700 text-sm font-semibold text-brand-800">
              {index + 1}
            </span>
            <span className="pt-0.5 text-slate-600">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-10 border border-slate-200 p-6">
        <p className="eyebrow">Issuer → Learner → Verifier</p>
        <p className="mt-1.5 text-sm text-slate-700">
          Sertifikatı verən → Sertifikatı alan → Sertifikatı yoxlayan
        </p>
      </div>
    </div>
  );
}

/** Bölmə 8 — "Təşkilatlar üçün" səhifəsi. */
export function ForOrganizations() {
  const features = [
    {
      title: 'Vahid idarəetmə paneli',
      text: 'Verdiyiniz bütün sertifikatları bir cədvəldə görün, ad, e-mail, kod və ya kurs adı üzrə axtarın.',
    },
    {
      title: 'Avtomatik unikal kod',
      text: 'Hər sertifikata DPL-000001 formatında təkrarlanmayan kod və QR kod verilir.',
    },
    {
      title: 'Kurs kataloqu',
      text: 'Kurs adları əvvəlcədən yaradılmış siyahıdan seçilir — yazılış fərqləri və təkrarlar aradan qalxır.',
    },
    {
      title: 'Ləğv etmə imkanı',
      text: 'Səhv verilmiş sertifikat silinmir, statusu "ləğv edilib" olur — tarixçə tam qalır.',
    },
    {
      title: 'Saxtakarlığın qarşısı',
      text: 'Yoxlayan şəxs sizə zəng etmədən sənədin həqiqiliyini bir neçə saniyəyə təsdiqləyir.',
    },
    {
      title: 'Müdavim təsdiqi',
      text: 'Sertifikat müdavimin hesabına bağlanır, o da sənədi təsdiqləyir və ya imtina edir.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
        Təşkilatlar üçün
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Təlim mərkəzi, universitet, akademiya, şirkətin daxili akademiyası və ya təhsil
        platformasısınızsa — sertifikatlarınızı Diplomly ilə idarə edin.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="card p-5">
            <h3 className="font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{feature.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/qeydiyyat/teskilat" className="btn-primary">
          Təşkilat kimi qeydiyyatdan keç
        </Link>
        <Link to="/daxil-ol" className="btn-secondary">
          Artıq hesabım var
        </Link>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Səhifə tapılmadı</h1>
      <p className="mt-2 text-sm text-slate-500">
        Axtardığınız səhifə mövcud deyil və ya ünvanı dəyişib.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Ana səhifəyə qayıt
      </Link>
    </div>
  );
}
