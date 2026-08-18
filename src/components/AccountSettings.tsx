import { useState } from 'react';
import { Alert, Spinner } from './ui';
import { useAuth } from '../context/AuthContext';
import { ApiError, authApi } from '../lib/api';

/**
 * Hesab ayarları: ad/soyadın yenilənməsi və şifrənin dəyişdirilməsi.
 *
 * Həm müdavim, həm də təşkilat profilində eyni formada lazım olduğu üçün
 * ayrıca komponentdir.
 *
 * E-mail qəsdən dəyişdirilmir: sertifikatlar müdavimə məhz e-mail üzrə
 * bağlanır (bölmə 3.1), ona görə onun dəyişməsi mövcud sertifikatların
 * əlaqəsini qırardı.
 */
export function AccountSettings() {
  const { user, refresh } = useAuth();

  // --- Profil ---
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    surname: user?.surname ?? '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSaved, setProfileSaved] = useState(false);

  // --- Şifrə ---
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileErrors({});
    setProfileSaved(false);

    try {
      await authApi.updateProfile({
        name: profile.name.trim(),
        surname: profile.surname.trim(),
      });
      await refresh();
      setProfileSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setProfileError(err.message);
        setProfileErrors(err.fieldErrors);
      } else {
        setProfileError('Profil yenilənə bilmədi');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordErrors({});
    setPasswordSaved(false);

    // Təkrar sahəsi serverə göndərilmir — burada yoxlanılır.
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Şifrələr uyğun gəlmir' });
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordError(err.message);
        setPasswordErrors(err.fieldErrors);
      } else {
        setPasswordError('Şifrə dəyişdirilə bilmədi');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Ad və soyad --- */}
      <form onSubmit={handleProfile} className="card p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Şəxsi məlumatlar</h2>

        {profileError && (
          <div className="mb-4">
            <Alert>{profileError}</Alert>
          </div>
        )}
        {profileSaved && (
          <div className="mb-4">
            <Alert variant="success">Məlumatlar yadda saxlanıldı.</Alert>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-name" className="label">
              Ad
            </label>
            <input
              id="acc-name"
              value={profile.name}
              onChange={(e) => {
                setProfile((p) => ({ ...p, name: e.target.value }));
                setProfileSaved(false);
              }}
              className={`input ${profileErrors.name ? 'border-red-400' : ''}`}
              required
              minLength={2}
              maxLength={80}
              autoComplete="given-name"
            />
            {profileErrors.name && <p className="field-error">{profileErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="acc-surname" className="label">
              Soyad
            </label>
            <input
              id="acc-surname"
              value={profile.surname}
              onChange={(e) => {
                setProfile((p) => ({ ...p, surname: e.target.value }));
                setProfileSaved(false);
              }}
              className={`input ${profileErrors.surname ? 'border-red-400' : ''}`}
              required
              minLength={2}
              maxLength={80}
              autoComplete="family-name"
            />
            {profileErrors.surname && <p className="field-error">{profileErrors.surname}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="acc-email" className="label">
            E-mail
          </label>
          <input
            id="acc-email"
            value={user?.email ?? ''}
            className="input bg-slate-50"
            disabled
            readOnly
          />
          <p className="mt-1.5 text-xs text-slate-500">
            E-mail dəyişdirilmir — sertifikatlar məhz bu ünvana bağlanır.
          </p>
        </div>

        <button type="submit" className="btn-primary mt-5" disabled={profileSaving}>
          {profileSaving && <Spinner className="h-4 w-4" />}
          Yadda saxla
        </button>
      </form>

      {/* --- Şifrə --- */}
      <form onSubmit={handlePassword} className="card p-6">
        <h2 className="mb-1 text-base font-semibold text-slate-900">Şifrəni dəyiş</h2>
        <p className="mb-4 text-sm text-slate-500">
          Təhlükəsizlik üçün cari şifrənizi də daxil etməlisiniz.
        </p>

        {passwordError && (
          <div className="mb-4">
            <Alert>{passwordError}</Alert>
          </div>
        )}
        {passwordSaved && (
          <div className="mb-4">
            <Alert variant="success">Şifrə dəyişdirildi.</Alert>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="acc-current" className="label">
              Cari şifrə
            </label>
            <input
              id="acc-current"
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
              }
              className={`input ${passwordErrors.currentPassword ? 'border-red-400' : ''}`}
              required
              autoComplete="current-password"
            />
            {passwordErrors.currentPassword && (
              <p className="field-error">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="acc-new" className="label">
                Yeni şifrə
              </label>
              <input
                id="acc-new"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                className={`input ${passwordErrors.newPassword ? 'border-red-400' : ''}`}
                required
                minLength={6}
                autoComplete="new-password"
              />
              {passwordErrors.newPassword ? (
                <p className="field-error">{passwordErrors.newPassword}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-500">Ən azı 6 simvol.</p>
              )}
            </div>

            <div>
              <label htmlFor="acc-confirm" className="label">
                Yeni şifrə (təkrar)
              </label>
              <input
                id="acc-confirm"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                className={`input ${passwordErrors.confirmPassword ? 'border-red-400' : ''}`}
                required
                minLength={6}
                autoComplete="new-password"
              />
              {passwordErrors.confirmPassword && (
                <p className="field-error">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary mt-5" disabled={passwordSaving}>
          {passwordSaving && <Spinner className="h-4 w-4" />}
          Şifrəni dəyiş
        </button>
      </form>
    </div>
  );
}
