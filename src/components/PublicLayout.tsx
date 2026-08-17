import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './ui';

/** Bölmə 8 — public sayt menyusu. */
const NAV = [
  { to: '/', label: 'Ana səhifə', end: true },
  { to: '/yoxla', label: 'Sertifikatı yoxla' },
  { to: '/haqqinda', label: 'Diplomly haqqında' },
  { to: '/teskilatlar-ucun', label: 'Təşkilatlar üçün' },
];

export function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Aktiv linkin altındakı xətt yeni linkə sürüşərək keçir (sərt tullanma yox).
  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, [location.pathname]);

  const panelPath = user?.role === 'ORG_OWNER' ? '/teskilat' : '/panel';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-1">
            <Logo />
            <span className="font-wordmark text-base font-semibold uppercase tracking-wide text-slate-900">
              Diplomly
            </span>
          </Link>

          <nav ref={navRef} className="relative hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-brand-800' : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {indicator && (
              <span
                className="absolute bottom-0 h-0.5 bg-brand-700 transition-all duration-300 ease-out"
                style={{ left: indicator.left, width: indicator.width }}
              />
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to={panelPath} className="btn-primary">
                Panelə keç
              </Link>
            ) : (
              <>
                <Link to="/daxil-ol" className="btn-secondary hidden sm:inline-flex">
                  Daxil ol
                </Link>
                <Link to="/qeydiyyat" className="btn-primary">
                  Qeydiyyat
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobil naviqasiya */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span>© {new Date().getFullYear()} Diplomly</span>
          </div>
          <p>Sertifikatı verən → Sertifikatı alan → Sertifikatı yoxlayan</p>
        </div>
      </footer>
    </div>
  );
}
