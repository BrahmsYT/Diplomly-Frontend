import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PanelLayout } from './components/PanelLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './components/PublicLayout';
import { AuthProvider } from './context/AuthContext';

import { Login } from './pages/auth/Login';
import { RegisterChoice, RegisterLearner, RegisterOrganization } from './pages/auth/Register';

import { CertificateDetail } from './pages/learner/CertificateDetail';
import { LearnerDashboard } from './pages/learner/LearnerDashboard';
import { LearnerProfile } from './pages/learner/LearnerProfile';
import { MyCertificates } from './pages/learner/MyCertificates';

import { Courses } from './pages/organization/Courses';
import { NewCertificate } from './pages/organization/NewCertificate';
import { OrgCertificateDetail } from './pages/organization/OrgCertificateDetail';
import { OrgCertificates } from './pages/organization/OrgCertificates';
import { OrgDashboard } from './pages/organization/OrgDashboard';
import { OrgProfile } from './pages/organization/OrgProfile';

import { Home } from './pages/public/Home';
import { About, ForOrganizations, NotFound } from './pages/public/Info';
import { PublicCertificatePage } from './pages/public/PublicCertificate';
import { Verify } from './pages/public/Verify';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Public sayt (bölmə 5 və 8) --- */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="yoxla" element={<Verify />} />
            <Route path="haqqinda" element={<About />} />
            <Route path="teskilatlar-ucun" element={<ForOrganizations />} />

            {/* Bölmə 3.6 — paylaşılan sertifikat linki, QR kod bura yönləndirir */}
            <Route path="certificate/:code" element={<PublicCertificatePage />} />

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
            <Route path="yeni-sertifikat" element={<NewCertificate />} />
            <Route path="kurslar" element={<Courses />} />
            <Route path="melumatlar" element={<OrgProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
