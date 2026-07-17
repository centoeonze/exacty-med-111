/** Client helpers for CMS auth — Express API only (Stage 10A). */

export type CmsSessionState = {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    username: string | null;
    role: string;
  };
};

export type CmsLoginResult =
  | { ok: true }
  | { ok: false; error: string };

/** Stage 10A — Auth API is the only provider. */
export type CmsAuthProviderMode = "api";

export const resolveCmsAuthProvider = (): CmsAuthProviderMode => "api";

const AUTH = {
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  session: "/api/auth/me",
} as const;

const jsonFetch = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw Object.assign(new Error((data as { error?: string }).error || "Falha na autenticação."), {
      status: res.status,
      data,
    });
  }
  return data;
};

export const fetchCmsSession = async (): Promise<CmsSessionState> => {
  try {
    const data = await jsonFetch<CmsSessionState>(AUTH.session);
    return {
      authenticated: Boolean(data.authenticated),
      user: data.user,
    };
  } catch {
    return { authenticated: false };
  }
};

export const loginCms = async (username: string, password: string): Promise<CmsLoginResult> => {
  try {
    await jsonFetch<{ ok: boolean }>(AUTH.login, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return { ok: true };
  } catch (error) {
    const err = error as { data?: { error?: string }; message?: string };
    return {
      ok: false,
      error: err.data?.error || err.message || "Não foi possível entrar. Tente novamente.",
    };
  }
};

export const logoutCms = async () => {
  try {
    await jsonFetch<{ ok: boolean }>(AUTH.logout, { method: "POST" });
  } catch {
    // Session cleared client-side regardless of network errors.
  }
};
