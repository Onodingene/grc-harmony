// src/lib/api.ts

let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

const BASE_URL = import.meta.env.VITE_API_URL as string;

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string>),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  // Token expired — try silent refresh
  if (response.status === 401) {
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json() as ApiResponse<{ accessToken: string }>;
      accessToken = refreshData.data?.accessToken ?? null;

      // Retry original request with new token
      return fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
          ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
          ...(options.headers as Record<string, string>),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      }).then(r => r.json() as Promise<ApiResponse<T>>);
    } else {
      accessToken = null;
      window.location.href = '/login';
      return { data: null, error: 'Session expired' };
    }
  }

  return response.json() as Promise<ApiResponse<T>>;
}