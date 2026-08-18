import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PanelLayout } from './components/PanelLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './components/PublicLayout';
import { PageLoader } from './components/ui';
import { AuthProvider } from './context/AuthContext';

/**
 * Səhifələr `lazy` ilə yüklənir — ilk açılışda yalnız lazım olan səhifənin
 * kodu şəbəkədən gəlir. Layout-lar və qoruma komponentləri hər halda lazımdır,
 * ona görə onlar birbaşa import olunur.
 *
 * Praktik effekt: sertifikatı yoxlamaq üçün gələn şəxs təşkilat panelinin
 * kodunu heç vaxt yükləmir.
 */

// --- Public ---
const Home = lazy(() => import('./pages/public/Home').then((m) => ({ default: m.Home })));
const Verify = lazy(() => import('./pages/public/Verify').then((m) => ({ default: m.Verify })));
const PublicCertificatePage = lazy(() =>
  import('./pages/public/PublicCertificate').then((m) => ({ default: m.PublicCertificatePage })),
);
const TestData = lazy(() =>
  import('./pages/public/TestData').then((m) => ({ default: m.TestData })),
);
const About = lazy(() => import('./pages/public/Info').then((m) => ({ default: m.About })));
const ForOrganizations = lazy(() =>
  import('./pages/public/Info').then((m) => ({ default: m.ForOrganizations })),
);
const NotFound = lazy(() => import('./pages/public/Info').then((m) => ({ default: m.NotFound })));

// --- Auth ---
const Login = lazy(() => import('./pages/auth/Login').then((m) => ({ default: m.Login })));
const RegisterChoice = lazy(() =>
  import('./pages/auth/Register').then((m) => ({ default: m.RegisterChoice })),
);
const RegisterLearner = lazy(() =>
  import('./pages/auth/Register').then((m) => ({ default: m.RegisterLearner })),
);
const RegisterOrganization = lazy(() =>
  import('./pages/auth/Register').then((m) => ({ default: m.RegisterOrganization })),
);

// --- Müdavim paneli ---
const LearnerDashboard = lazy(() =>
  import('./pages/learner/LearnerDashboard').then((m) => ({ default: m.LearnerDashboard })),
);
const MyCertificates = lazy(() =>
  import('./pages/learner/MyCertificates').then((m) => ({ default: m.MyCertificates })),
);
const CertificateDetail = lazy(() =>
  import('./pages/learner/CertificateDetail').then((m) => ({ default: m.CertificateDetail })),
);
const LearnerProfile = lazy(() =>
  import('./pages/learner/LearnerProfile').then((m) => ({ default: m.LearnerProfile })),
);

// --- Təşkilat paneli ---
const OrgDashboard = lazy(() =>
  import('./pages/organization/OrgDashboard').then((m) => ({ default: m.OrgDashboard })),
);
const OrgCertificates = lazy(() =>
  import('./pages/organization/OrgCertificates').then((m) => ({ default: m.OrgCertificates })),
);
const OrgCertificateDetail = lazy(() =>
  import('./pages/organization/OrgCertificateDetail').then((m) => ({
    default: m.OrgCertificateDetail,
  })),
);
const NewCertificate = lazy(() =>
  import('./pages/organization/NewCertificate').then((m) => ({ default: m.NewCertificate })),
);
const EditCertificate = lazy(() =>
  import('./pages/organization/EditCertificate').then((m) => ({ default: m.EditCertificate })),
);
const Courses = lazy(() =>
  import('./pages/organization/Courses').then((m) => ({ default: m.Courses })),
);
const OrgProfile = lazy(() =>
  import('./pages/organization/OrgProfile').then((m) => ({ default: m.OrgProfile })),
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- Public sayt (bölmə 5 və 8) --- */}
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="yoxla" element={<Verify />} />
              <Route path="haqqinda" element={<About />} />
              <Route path="teskilatlar-ucun" element={<ForOrganizations />} />

              {/* Bölmə 3.6 — paylaşılan sertifikat linki, QR kod bura yönləndirir */}
              <Route path="certificate/:code" element={<PublicCertificatePage />} />

              {/* Demo: sınaq hesabları + nümunə məlumatların yaradılması */}
              <Route path="test" element={<TestData />} />

              <Route path="daxil-ol" element={<Login />} />
              <Route path="qeydiyyat" element={<RegisterChoice />} />
              <Route path="qeydiyyat/mudavim" element={<RegisterLearner />} />
              <Route path="qeydiyyat/teskilat" element={<RegisterOrganization />} />

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* --- Müdavim paneli (bölmə 3) --- */}
            <Route
              path="/panel"
              element={
                <ProtectedRoute role="LEARNER">
                  <PanelLayout variant="learner" />
                </ProtectedRoute>
              }
            >
              <Route index element={<LearnerDashboard />} />
              <Route path="sertifikatlar" element={<MyCertificates />} />
              <Route path="sertifikatlar/:code" element={<CertificateDetail />} />
              <Route path="profil" element={<LearnerProfile />} />
            </Route>

            {/* --- Təşkilat paneli (bölmə 4) --- */}
            <Route
              path="/teskilat"
              element={
                <ProtectedRoute role="ORG_OWNER">
                  <PanelLayout variant="organization" />
                </ProtectedRoute>
              }
            >
              <Route index element={<OrgDashboard />} />
              <Route path="sertifikatlar" element={<OrgCertificates />} />
              <Route path="sertifikatlar/:code" element={<OrgCertificateDetail />} />
              <Route path="sertifikatlar/:code/duzelis" element={<EditCertificate />} />
              <Route path="yeni-sertifikat" element={<NewCertificate />} />
              <Route path="kurslar" element={<Courses />} />
              <Route path="melumatlar" element={<OrgProfile />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
