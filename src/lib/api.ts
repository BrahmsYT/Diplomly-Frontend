import type {
  Certificate,
  Course,
  LearnerLookup,
  LearnerStats,
  Organization,
  OrganizationStats,
  Pagination,
  User,
  VerifyResult,
  Visibility,
} from '../types';

/**
 * API-nin kök ünvanı.
 *
 * Development: boş qalır. Sorğu `/api/...` kimi öz domenimizə gedir və
 *   Vite dev serveri onu backend-ə yönləndirir (bax vite.config.ts → proxy).
 *   Backend portu `frontend/.env` faylındakı BACKEND_PORT ilə idarə olunur —
 *   həmin dəyişən yalnız Vite tərəfindədir, brauzerə çatmır.
 *
 * Production: Vercel-də proxy yoxdur, ona görə tam ünvan lazımdır. Dəyər
 *   `VITE_API_URL` mühit dəyişənindən gəlir və **build anında** bundle-a
 *   yazılır — dəyişdikdən sonra yenidən deploy etmək lazımdır.
 */
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const TOKEN_KEY = 'diplomly_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Form sahələrinə bağlanmış xətaları {sahə: mesaj} şəklində qaytarır. */
  get fieldErrors(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const detail of this.details ?? []) {
      map[detail.field] = detail.message;
    }
    return map;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(response.status, 'Serverdən gözlənilməz cavab alındı');
  }

  const body = payload as {
    success?: boolean;
    data?: T;
    error?: { message: string; code: string; details?: FieldError[] };
  };

  if (!response.ok || body.success === false) {
    // 401 - token köhnəlib, istifadəçini çıxardırıq.
    if (response.status === 401) {
      tokenStore.clear();
    }
    throw new ApiError(
      response.status,
      body.error?.message ?? 'Xəta baş verdi',
      body.error?.code,
      body.error?.details,
    );
  }

  // Siyahı endpointləri `data` əvəzinə birbaşa `items`/`pagination` qaytarır.
  return (body.data !== undefined ? body.data : (body as unknown)) as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' });

// ---------------- Auth ----------------

export interface AuthPayload {
  token: string;
  user: User;
  linkedCertificates?: number;
}

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthPayload>('/api/auth/login', { email, password }),

  registerLearner: (input: {
    name: string;
    surname: string;
    email: string;
    password: string;
  }) => post<AuthPayload>('/api/auth/register/learner', input),

  registerOrganization: (input: {
    organization: Record<string, string>;
    owner: Record<string, string>;
  }) => post<AuthPayload>('/api/auth/register/organization', input),

  me: () => get<User>('/api/auth/me'),
};

// ---------------- Public (login tələb etmir) ----------------

export const publicApi = {
  verify: (query: string) => get<VerifyResult>(`/api/public/verify?q=${encodeURIComponent(query)}`),

  certificate: (code: string) =>
    get<Extract<VerifyResult, { type: 'code' }>>(
      `/api/public/certificates/${encodeURIComponent(code)}`,
    ),

  qr: (code: string) =>
    get<{ code: string; url: string; dataUrl: string }>(
      `/api/public/certificates/${encodeURIComponent(code)}/qr`,
    ),

  stats: () => get<{ certificates: number; organizations: number }>('/api/public/stats'),
};

// ---------------- Təşkilat ----------------

export const orgApi = {
  me: () => get<Organization>('/api/organizations/me'),
  update: (input: Record<string, string>) => put<Organization>('/api/organizations/me', input),
  stats: () => get<OrganizationStats>('/api/organizations/me/stats'),

  courses: () => get<Course[]>('/api/organizations/me/courses'),
  createCourse: (name: string) => post<Course>('/api/organizations/me/courses', { name }),
  updateCourse: (id: string, name: string) =>
    put<Course>(`/api/organizations/me/courses/${id}`, { name }),
  deleteCourse: (id: string) => del<{ message: string }>(`/api/organizations/me/courses/${id}`),
};

// ---------------- Sertifikatlar (təşkilat tərəfi) ----------------

export interface CertificateListParams {
  search?: string;
  status?: 'all' | 'issued' | 'expired' | 'revoked';
  page?: number;
  limit?: number;
}

export const certificateApi = {
  list: (params: CertificateListParams = {}) => {
    const search = new URLSearchParams();
    if (params.search) search.set('search', params.search);
    if (params.status && params.status !== 'all') search.set('status', params.status);
    search.set('page', String(params.page ?? 1));
    search.set('limit', String(params.limit ?? 20));

    return get<{ items: Certificate[]; pagination: Pagination }>(`/api/certificates?${search}`);
  },

  create: (input: Record<string, unknown>) => post<Certificate>('/api/certificates', input),

  detail: (code: string) => get<Certificate>(`/api/certificates/${encodeURIComponent(code)}`),

  revoke: (code: string) =>
    post<Certificate>(`/api/certificates/${encodeURIComponent(code)}/revoke`),

  /** Bölmə 4.5 — e-mail daxil edildikdə ad/soyadın avtomatik gətirilməsi */
  lookupLearner: (email: string) =>
    get<LearnerLookup>(`/api/certificates/lookup-learner?email=${encodeURIComponent(email)}`),
};

// ---------------- Müdavim ----------------

// ---------------- Test / demo ----------------

export interface SeedStatus {
  seeded: boolean;
  counts: { users: number; organizations: number; courses: number; certificates: number };
  password: string;
  accounts: Array<{ role: string; email: string; label: string }>;
}

export interface SeedResult {
  message: string;
  organizations: number;
  courses: number;
  certificates: number;
  firstCode: string;
  lastCode: string;
  password: string;
}

export const testApi = {
  status: () => get<SeedStatus>('/api/test/status'),
  seed: () => post<SeedResult>('/api/test/seed'),
};

export const learnerApi = {
  stats: () => get<LearnerStats>('/api/learner/stats'),
  certificates: () => get<Certificate[]>('/api/learner/certificates'),
  detail: (code: string) => get<Certificate>(`/api/learner/certificates/${encodeURIComponent(code)}`),

  setVisibility: (code: string, visibility: Visibility) =>
    patch<Certificate>(`/api/learner/certificates/${encodeURIComponent(code)}/visibility`, {
      visibility,
    }),

  decide: (code: string, decision: 'accepted' | 'rejected') =>
    patch<Certificate>(`/api/learner/certificates/${encodeURIComponent(code)}/acceptance`, {
      decision,
    }),
};
