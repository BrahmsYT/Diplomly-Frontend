# Diplomly — Frontend

Diplomly platformasının veb interfeysi: public sayt, müdavim paneli və təşkilat paneli.

**Stack:** React 18 · Vite · TypeScript · Tailwind CSS · React Router · html2canvas + jsPDF

> Backend ayrı qovluqdadır və ayrı işə salınır: [`../backend`](../backend)

---

## İşə salma

Backend **əvvəlcədən işə salınmalıdır** (bax [`../backend/README.md`](../backend/README.md)).

```bash
npm install
npm run dev
```

→ http://localhost:5173

Sayt `/api` sorğularını Vite proxy vasitəsilə backend-ə yönləndirir, ona görə brauzerdə CORS problemi yaranmır.

---

## Mühit dəyişənləri (`.env`)

| Dəyişən | Default | Təyinat |
|---|---|---|
| `BACKEND_PORT` | `4001` | Vite proxy-nin hədəf portu. `backend/.env` faylındakı `PORT` ilə **eyni olmalıdır**. |
| `VITE_API_URL` | boş | Yalnız production build üçün — API-nin tam ünvanı. Development-də boş saxlanılır. |

---

## Qovluq strukturu

```
frontend/
├── index.html
├── vite.config.ts             Dev server + /api proxy
├── tailwind.config.js         Rəng palitrası, şriftlər, kölgələr
└── src/
    ├── main.tsx               Giriş nöqtəsi
    ├── App.tsx                Bütün route-lar
    ├── types.ts               Backend cavablarının tipləri
    ├── index.css              Tailwind + təkrar istifadə olunan siniflər
    ├── context/
    │   └── AuthContext.tsx    Sessiya, login/logout, rol yoxlaması
    ├── lib/
    │   ├── api.ts             API client, token saxlanması, ApiError
    │   ├── download.ts        PDF/JPG yaradılması, panoya kopyalama
    │   └── format.ts          Tarix formatlaması (az-AZ)
    ├── components/
    │   ├── PublicLayout.tsx        Public sayt naviqasiyası + footer
    │   ├── PanelLayout.tsx         Panel yan menyusu (hər iki rol üçün)
    │   ├── ProtectedRoute.tsx      Rola görə giriş qoruması
    │   ├── CertificateTemplate.tsx Sertifikatın vizual şablonu
    │   ├── CertificateCard.tsx     Müdavim panelindəki kart görünüşü
    │   └── ui.tsx                  StatCard, StatusBadge, Alert, Spinner...
    └── pages/
        ├── public/            Ana səhifə, yoxlama, public sertifikat, info
        ├── auth/              Giriş və qeydiyyat
        ├── learner/           Müdavim paneli (bölmə 3)
        └── organization/      Təşkilat paneli (bölmə 4)
```

---

## Route-lar

### Public sayt — login tələb olunmur

| Yol | Səhifə | TT bölməsi |
|---|---|---|
| `/` | Ana səhifə + böyük axtarış | 5 |
| `/yoxla` | Sertifikat yoxlama nəticələri | 5.1–5.5 |
| `/certificate/:code` | **Paylaşılan sertifikat səhifəsi** — QR kod bura yönləndirir | 3.6 / 7.8 |
| `/haqqinda` | Diplomly haqqında | 8 |
| `/teskilatlar-ucun` | Təşkilatlar üçün | 8 |
| `/daxil-ol` | Giriş | — |
| `/qeydiyyat` | Qeydiyyat növünün seçimi | — |
| `/qeydiyyat/mudavim` | Müdavim qeydiyyatı | 3.1 |
| `/qeydiyyat/teskilat` | Təşkilat qeydiyyatı | 4.1 |

### Müdavim paneli — rol: `LEARNER`

| Yol | Səhifə | TT bölməsi |
|---|---|---|
| `/panel` | Dashboard + statistika | 3.2 |
| `/panel/sertifikatlar` | Sertifikatlarım (filtr + axtarış) | 3.3 |
| `/panel/sertifikatlar/:code` | Detal · təsdiq · paylaşma · görünürlük · yükləmə | 3.4–3.7 |
| `/panel/profil` | Profil | 8 |

### Təşkilat paneli — rol: `ORG_OWNER`

| Yol | Səhifə | TT bölməsi |
|---|---|---|
| `/teskilat` | Dashboard + statistika | 4.2 |
| `/teskilat/sertifikatlar` | Cədvəl, axtarış, səhifələmə | 4.3 / 4.4 |
| `/teskilat/sertifikatlar/:code` | Detal + ləğv etmə | 4.8 |
| `/teskilat/yeni-sertifikat` | Yeni sertifikat formu | 4.5 |
| `/teskilat/kurslar` | Kurs kataloqu | 4.5 |
| `/teskilat/melumatlar` | Təşkilat məlumatları + sertifikat görünüşü | 4.9 |

Rol uyğun gəlmirsə istifadəçi «icazə yoxdur» səhifəsi əvəzinə **öz panelinə yönləndirilir** ([`ProtectedRoute.tsx`](src/components/ProtectedRoute.tsx)).

---

## API ilə əlaqə

Bütün sorğular [`src/lib/api.ts`](src/lib/api.ts) faylından keçir. Modul üzrə qruplaşdırılıb:

```ts
import { authApi, publicApi, orgApi, certificateApi, learnerApi } from './lib/api';

const certificates = await learnerApi.certificates();
const result = await publicApi.verify('DPL-000245');
```

**Token** `localStorage`-də saxlanılır və hər sorğuya avtomatik əlavə olunur. Server `401` qaytardıqda token təmizlənir.

**Xətalar** `ApiError` kimi atılır:

```ts
try {
  await certificateApi.create(payload);
} catch (err) {
  if (err instanceof ApiError) {
    setError(err.message);
    setFieldErrors(err.fieldErrors);   // { learnerEmail: "Düzgün e-mail..." }
  }
}
```

`fieldErrors` backend-in Zod validasiya detallarını `{sahə: mesaj}` şəklinə çevirir və birbaşa form sahələrinə bağlanır.

---

## Sessiya idarəetməsi

[`AuthContext`](src/context/AuthContext.tsx) bütün tətbiqi əhatə edir:

```ts
const { user, loading, isOrganization, isLearner, login, logout, refresh } = useAuth();
```

Səhifə yeniləndikdə `localStorage`-dəki token ilə `GET /api/auth/me` çağırılır və sessiya bərpa olunur. Token etibarsızdırsa avtomatik təmizlənir.

---

## Sertifikat şablonu və PDF/JPG

[`CertificateTemplate.tsx`](src/components/CertificateTemplate.tsx) — bölmə 4.9-un tələb etdiyi bütün elementləri daşıyır: Diplomly loqosu, təşkilatın loqosu, müdavimin adı, kurs adı, verilmə tarixi, sertifikat kodu, QR kod, rəhbərin adı, imza sahəsi. Ləğv edilmiş sertifikatda «LƏĞV EDİLİB» su nişanı görünür.

**Vacib qeyd:** bu komponentdə Tailwind sinifləri deyil, **inline stillər** istifadə olunur. `html2canvas` xarici CSS sinifləri və müasir rəng funksiyalarını həmişə düzgün oxumur — inline heks rənglərlə yüklənən fayl ekrandakı görüntü ilə eyni çıxır.

**Yükləmə axını** (bölmə 3.7):

```
CertificateTemplate (React)  →  html2canvas (2x scale)  →  canvas
                                                            ├→ toDataURL('image/jpeg')  →  JPG
                                                            └→ jsPDF (A4 landscape)     →  PDF
```

Serverdə ayrıca PDF generatoruna ehtiyac yoxdur. Bu iki kitabxana ~600 kB-dır və **dinamik import** ilə yalnız yükləmə düyməsinə basıldıqda gətirilir — əsas bundle-a düşmür.

---

## Dizayn sistemi

Tailwind konfiqurasiyasında `brand` rəng palitrası təyin olunub ([`tailwind.config.js`](tailwind.config.js)).

Təkrarlanan siniflər [`src/index.css`](src/index.css) faylında toplanıb:

| Sinif | Təyinat |
|---|---|
| `.btn-primary` / `.btn-secondary` / `.btn-danger` | Düymələr |
| `.input` | Form sahələri |
| `.label` | Sahə etiketləri |
| `.card` | Kart konteyneri |
| `.field-error` | Sahə altındakı xəta mətni |

Ümumi komponentlər [`src/components/ui.tsx`](src/components/ui.tsx) faylındadır: `StatCard`, `StatusBadge`, `AcceptanceBadge`, `Alert`, `Spinner`, `PageLoader`, `EmptyState`, `PageHeader`, `DetailRow`, `Logo`.

Bütün panellər və cədvəllər mobil üçün uyğunlaşdırılıb — cədvəllər kiçik ekranda kart görünüşünə keçir.

---

## Əmrlər

| Əmr | Nə edir |
|---|---|
| `npm run dev` | Vite dev serveri (HMR) |
| `npm run build` | Tipləri yoxlayır və production build yaradır → `dist/` |
| `npm run preview` | Build-i lokal olaraq işə salır |
| `npm run typecheck` | Yalnız TypeScript yoxlaması |

### Build ölçüləri

| Fayl | Ölçü | gzip |
|---|---|---|
| `index.js` (əsas) | 263 kB | 78 kB |
| `html2canvas` | 202 kB | 48 kB |
| `jspdf` | 358 kB | 118 kB |
| CSS | 29 kB | 5 kB |

html2canvas və jsPDF ayrı chunk-lardadır və yalnız sertifikat yükləndikdə şəbəkədən gəlir.

---

## Sınaq hesabları

Backend seed edildikdən sonra (şifrə hamısı üçün `parol123`):

| Rol | E-mail | Nə görünür |
|---|---|---|
| Təşkilat | `admin@abcacademy.az` | 4 sertifikat, 4 kurs, ləğv edilmiş nümunə |
| Müdavim | `saleh@example.com` | 3 sertifikat — biri təsdiq gözləyir, biri müddəti bitib |

Yoxlama səhifəsini sınamaq üçün: `DPL-000001` (aktiv) · `DPL-000002` (müddəti bitib) · `DPL-000005` (ləğv edilib) · `saleh@example.com` (e-maillə axtarış)

---

## Tez-tez rast gəlinən problemlər

**Sorğular 404 və ya `ECONNREFUSED` qaytarır**
Backend işləmir və ya port uyğun gəlmir. `frontend/.env` faylındakı `BACKEND_PORT` `backend/.env` faylındakı `PORT` ilə eyni olmalıdır. `.env` dəyişikliyindən sonra Vite yenidən işə salınmalıdır.

**Səhifə boş açılır**
Brauzerin konsoluna baxın. Çox vaxt səbəb backend-in işləməməsidir — `AuthContext` başlanğıcda `GET /api/auth/me` çağırır.

**PDF-də loqo görünmür**
Təşkilatın loqosu URL ilə verilir və `html2canvas` onu çəkmək üçün CORS icazəsi tələb edir. Loqo hostu `Access-Control-Allow-Origin` başlığı qaytarmalıdır.

**Girişdən sonra yanlış panelə düşürəm**
Rol backend-dən gəlir. `GET /api/auth/me` cavabındakı `role` dəyərini yoxlayın.

---

## Production build

```bash
npm run build
npm run preview     # yoxlamaq üçün
```

Production-da Vite proxy **işləmir** — `dist/` statik fayllardır. İki yol var:

1. `.env` faylında `VITE_API_URL=https://api.diplomly.com` təyin edin (backend-də CORS icazəsi lazımdır); və ya
2. `dist/` qovluğunu backend ilə eyni domendə yerləşdirib `/api` yolunu reverse proxy (nginx) ilə yönləndirin — bu halda `VITE_API_URL` boş qalır.

SPA olduğu üçün server bütün naməlum yolları `index.html`-ə yönləndirməlidir, əks halda `/certificate/DPL-000245` linki birbaşa açıldıqda 404 verər.
