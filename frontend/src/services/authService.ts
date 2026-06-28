import type { User } from "@/mock/types";
import { apiGet, apiPost, setTokens, clearTokens } from "./api";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    roles: string[];
  };
}

function mapLoginUser(resp: LoginResponse): User {
  const role = resp.user.roles[0] || "PROCESSOR";
  const names = resp.user.full_name.split(' ');
  const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return {
    id: resp.user.id,
    name: resp.user.full_name,
    email: resp.user.email,
    role: role as User['role'],
    initials,
  };
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const resp = await apiPost<LoginResponse>('/auth/login', { email, password });
    setTokens(resp.access_token, resp.refresh_token);
    return mapLoginUser(resp);
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}

export function logout() {
  apiPost('/auth/logout').catch(() => {});
  clearTokens();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const resp = await apiGet<{ id: string; full_name: string; email: string; roles: string[] }>('/auth/me');
    const role = resp.roles[0] || "PROCESSOR";
    const names = resp.full_name.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return {
      id: resp.id,
      name: resp.full_name,
      email: resp.email,
      role: role as User['role'],
      initials
    };
  } catch (error) {
    console.error("Fetch current user failed:", error);
    return null;
  }
}

export function getDemoUsers(): User[] {
  return [
    { id: "u1", name: "Admin User", email: "admin@docuflow.ai", role: "ADMIN", initials: "AU" },
    { id: "u2", name: "Process User", email: "processor@docuflow.ai", role: "PROCESSOR", initials: "PU" },
    { id: "u3", name: "Review User", email: "reviewer@docuflow.ai", role: "REVIEWER", initials: "RU" },
    { id: "u4", name: "Approval User", email: "approver@docuflow.ai", role: "APPROVER", initials: "AP" },
  ];
}
