const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('docuflow.token') : null;
}

export function setTokens(access: string, refresh: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('docuflow.token', access);
    localStorage.setItem('docuflow.refresh_token', refresh);
  }
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('docuflow.token');
    localStorage.removeItem('docuflow.refresh_token');
    localStorage.removeItem('docuflow.user');
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  
  if (res.status === 401) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  
  return res.json();
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
