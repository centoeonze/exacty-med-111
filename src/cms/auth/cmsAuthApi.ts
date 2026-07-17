/** Client helpers for CMS auth API (credentials never leave the server). */

export type CmsSessionState = { authenticated: boolean };

export type CmsLoginResult =
  | { ok: true }
  | { ok: false; error: string };

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
    return await jsonFetch<CmsSessionState>("/api/cms-auth/session");
  } catch {
    return { authenticated: false };
  }
};

export const loginCms = async (username: string, password: string): Promise<CmsLoginResult> => {
  try {
    await jsonFetch<{ ok: boolean }>("/api/cms-auth/login", {
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
    await jsonFetch<{ ok: boolean }>("/api/cms-auth/logout", { method: "POST" });
  } catch {
    // Session cleared client-side regardless of network errors.
  }
};
