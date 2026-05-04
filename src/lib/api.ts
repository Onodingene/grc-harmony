let accessToken: string | null = localStorage.getItem("accessToken");

export function setAccessToken(token: string) {
  accessToken = token;
  localStorage.setItem("accessToken", token);
}

export function clearAccessToken() {
  accessToken = null;
  localStorage.removeItem("accessToken");
}

export function getAccessToken() {
  if (!accessToken) {
    accessToken = localStorage.getItem("accessToken");
  }
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
    credentials: "include",
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options.headers as Record<string, string>),
      ...(getAccessToken()
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

  const isAuthRoute =
    path.includes("/auth/login") ||
    path.includes("/auth/refresh") ||
    path.includes("/auth/register");

  if (response.status === 401 && !isAuthRoute) {
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const refreshData = (await refreshRes.json()) as ApiResponse<{
        accessToken: string;
      }>;
      if (refreshData.data?.accessToken) {
        setAccessToken(refreshData.data.accessToken);
      }
      // Retry original request with new token
      return fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          ...(!isFormData ? { "Content-Type": "application/json" } : {}),
          ...(options.headers as Record<string, string>),
          ...(getAccessToken()
            ? { Authorization: `Bearer ${getAccessToken()}` }
            : {}),
        },
      }).then((r) => r.json() as Promise<ApiResponse<T>>);
    } else {
      accessToken = null;
      window.location.href = "/login";
      return { data: null, error: "Session expired" };
    }
  }

  return response.json() as Promise<ApiResponse<T>>;
}
