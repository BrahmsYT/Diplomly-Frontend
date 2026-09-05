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
  const [menuOpen, setMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // Aktiv linkin altındakı xətt yeni linkə sürüşərək keçir (sərt tullanma yox).
  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, [location.pathname]);

  // Səhifə dəyişdikdə mobil menyu bağlanır (geri/irəli düymələri daxil olmaqla).
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Ekran md-ə (768px) genişlənəndə panel `md:hidden` ilə gizlənir, amma vəziyyət
  // açıq qalsaydı arxa fon kilidi də qalardı — masaüstündə səhifə sürüşməzdi.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      if (mq.matches) setMenuOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Menyu açıq ikən arxa fon sürüşməsin; Escape menyunu bağlasın.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const panelPath = user?.role === 'ORG_OWNER' ? '/teskilat' : '/panel';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-1">
            <Logo className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="font-wordmark text-base font-semibold uppercase tracking-wide text-slate-900">
              Diplomly
            </span>
          </Link>

          {/* Masaüstü naviqasiyası */}
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

          {/* Masaüstü hesab düymələri */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {user ? (
              <Link to={panelPath} className="btn-primary whitespace-nowrap">
                Panelə keç
              </Link>
            ) : (
              <>
                <Link to="/daxil-ol" className="btn-secondary whitespace-nowrap">
                  Daxil ol
                </Link>
                <Link to="/qeydiyyat" className="btn-primary whitespace-nowrap">
                  Qeydiyyat
                </Link>
              </>
            )}
          </div>

          {/*
            Mobil menyu düyməsi.
            Əvvəl burada yan-sürüşən link zolağı vardı — 320-414px arasında son
            linklər ekrandan kənarda qalırdı və "Daxil ol" ümumiyyətlə görünmürdü.
            Açılan menyu bütün maddələri əlçatan edir və başlığı 114px-dən 64px-ə salır.
          */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label={menuOpen ? 'Menyunu bağla' : 'Menyunu aç'}
            aria-expanded={menuOpen}
            aria-controls="mobil-menyu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
              {menuOpen ? (
                <path strokeLinecap="round" strokeWidth="1.8" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobil menyu paneli */}
        {menuOpen && (
          <nav
            id="mobil-menyu"
            className="relative z-50 border-t border-slate-100 bg-white px-4 pb-4 pt-2 shadow-lift md:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <Link to={panelPath} className="btn-primary w-full">
                  Panelə keç
                </Link>
              ) : (
                <>
                  <Link to="/daxil-ol" className="btn-secondary w-full">
                    Daxil ol
                  </Link>
                  <Link to="/qeydiyyat" className="btn-primary w-full">
                    Qeydiyyat
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Menyudan kənara toxunuş da onu bağlayır */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Menyunu bağla"
          className="fixed inset-0 z-30 bg-slate-900/20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="paper border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center text-sm text-slate-500 sm:flex-row sm:px-6 sm:text-left">
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
