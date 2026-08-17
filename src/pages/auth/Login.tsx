import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Logo, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../lib/api';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      // Rola uyğun panelə yönləndiririk; qorunan səhifədən gəlibsə oraya qaytarırıq.
      const fallback = user.role === 'ORG_OWNER' ? '/teskilat' : '/panel';
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? fallback, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Giriş zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo className="h-11 w-11" />
        <h1 className="font-display mt-4 text-2xl font-semibold text-slate-900">Diplomly-yə daxil ol</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Müdavim və təşkilat hesabları eyni formdan giriş edir.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && <Alert>{error}</Alert>}

        <div>
          <label htmlFor="email" className="label">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
            placeholder="ad@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Şifrə
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />}
          Daxil ol
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Hesabınız yoxdur?{' '}
        <Link to="/qeydiyyat" className="font-medium text-brand-600 hover:text-brand-700">
          Qeydiyyatdan keçin
        </Link>
      </p>

      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <p className="mb-1.5 font-medium text-slate-600">Sınaq hesabları:</p>
        <p>Təşkilat: admin@abcacademy.az</p>
        <p>Müdavim: saleh@example.com</p>
        <p className="mt-1">Şifrə (hər ikisi üçün): parol123</p>
        <Link
          to="/test"
          className="mt-2.5 inline-block font-medium text-brand-600 hover:text-brand-700"
        >
          Baza boşdursa → nümunə məlumatları yarat
        </Link>
      </div>
    </div>
  );
}
