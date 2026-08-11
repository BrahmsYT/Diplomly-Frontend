import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi, tokenStore, type AuthPayload } from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isOrganization: boolean;
  isLearner: boolean;
  login: (email: string, password: string) => Promise<User>;
  applyAuth: (payload: AuthPayload) => User;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Səhifə yeniləndikdə localStorage-dəki token ilə sessiyanı bərpa edirik.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(setUser)
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyAuth = useCallback((payload: AuthPayload) => {
    tokenStore.set(payload.token);
    setUser(payload.user);
    return payload.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await authApi.login(email, password);
      return applyAuth(payload);
    },
    [applyAuth],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) return;
    try {
      setUser(await authApi.me());
    } catch {
      logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isOrganization: user?.role === 'ORG_OWNER',
      isLearner: user?.role === 'LEARNER',
      login,
      applyAuth,
      logout,
      refresh,
    }),
    [user, loading, login, applyAuth, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth yalnız AuthProvider daxilində istifadə oluna bilər');
  }
  return context;
}
