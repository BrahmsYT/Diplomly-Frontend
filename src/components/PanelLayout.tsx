import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';
import { Logo } from './ui';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

/** Bölmə 8 — müdavim və təşkilat panellərinin menyu strukturu. */
const LEARNER_NAV: NavItem[] = [
  { to: '/panel', label: 'Dashboard', end: true },
  { to: '/panel/sertifikatlar', label: 'Sertifikatlarım' },
  { to: '/panel/profil', label: 'Profil' },
];

const ORG_NAV: NavItem[] = [
  { to: '/teskilat', label: 'Dashboard', end: true },
  { to: '/teskilat/sertifikatlar', label: 'Sertifikatlar' },
  { to: '/teskilat/yeni-sertifikat', label: 'Yeni sertifikat' },
  { to: '/teskilat/kurslar', label: 'Kurslar' },
  { to: '/teskilat/melumatlar', label: 'Təşkilat məlumatları' },
];

export function PanelLayout({ variant }: { variant: 'learner' | 'organization' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = variant === 'learner' ? LEARNER_NAV : ORG_NAV;
  const title = variant === 'learner' ? 'Müdavim paneli' : 'Təşkilat paneli';
  const subtitle = variant === 'learner' ? `${user?.name} ${user?.surname}` : user?.organization?.name;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Yan menyu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">Diplomly</span>
          </Link>
        </div>

        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials(subtitle ?? user?.name ?? '?')}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{subtitle}</p>
              <p className="text-xs text-slate-500">{title}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            Çıxış
          </button>
        </nav>
      </aside>

      {menuOpen && (
        <button
          type="button"
          aria-label="Menyunu bağla"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Menyunu aç"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold">{title}</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
