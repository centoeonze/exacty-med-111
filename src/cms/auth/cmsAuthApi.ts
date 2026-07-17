/** Client helpers for CMS auth — local (static) or Express API. */

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

/** Dual auth: `local` for static hosting; `api` when Express is published. */
export type CmsAuthProviderMode = "local" | "api";

type LocalCreds = { username: string; password: string };

declare const __EXACTY_CMS_LOCAL_CREDS__: LocalCreds | null;

const LOCAL_SESSION_KEY = "exacty_cms_local_session";
const LOCAL_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const AUTH = {
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  session: "/api/auth/me",
} as const;

export const resolveCmsAuthProviderFrom = (
  raw?: string | null,
): CmsAuthProviderMode =>
  String(raw ?? "local").trim().toLowerCase() === "api" ? "api" : "local";

export const resolveCmsAuthProvider = (): CmsAuthProviderMode => {
  const meta = import.meta.env as ImportMetaEnv & {
    VITE_CMS_AUTH_PROVIDER?: string;
    CMS_AUTH_PROVIDER?: string;
  };
  return resolveCmsAuthProviderFrom(
    meta.VITE_CMS_AUTH_PROVIDER ?? meta.CMS_AUTH_PROVIDER,
  );
};

const getInjectedLocalCreds = (): LocalCreds | null => {
  if (typeof __EXACTY_CMS_LOCAL_CREDS__ === "undefined" || !__EXACTY_CMS_LOCAL_CREDS__) {
    return null;
  }
  return {
    username: String(__EXACTY_CMS_LOCAL_CREDS__.username ?? "").trim(),
    password: String(__EXACTY_CMS_LOCAL_CREDS__.password ?? ""),
  };
};

const getLocalCreds = (): LocalCreds => {
  const meta = import.meta.env as ImportMetaEnv & {
    VITE_CMS_USERNAME?: string;
    VITE_CMS_PASSWORD?: string;
  };
  const fromEnv: LocalCreds = {
    username: String(meta.VITE_CMS_USERNAME ?? "").trim(),
    password: String(meta.VITE_CMS_PASSWORD ?? ""),
  };
  if (fromEnv.username && fromEnv.password) return fromEnv;
  return getInjectedLocalCreds() ?? { username: "", password: "" };
};

const readLocalSession = (): boolean => {
  try {
    const raw = sessionStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { exp?: number };
    if (!parsed.exp || !Number.isFinite(parsed.exp) || Date.now() > parsed.exp) {
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const writeLocalSession = () => {
  sessionStorage.setItem(
    LOCAL_SESSION_KEY,
    JSON.stringify({ exp: Date.now() + LOCAL_SESSION_TTL_MS }),
  );
};

const clearLocalSession = () => {
  try {
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    // ignore
  }
};

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

const fetchLocalSession = async (): Promise<CmsSessionState> => ({
  authenticated: readLocalSession(),
});

const loginLocal = async (username: string, password: string): Promise<CmsLoginResult> => {
  const creds = getLocalCreds();
  if (!creds.username || !creds.password) {
    return {
      ok: false,
      error: "CMS não configurado. Defina CMS_USERNAME e CMS_PASSWORD no arquivo .env e reconstrua.",
    };
  }
  if (username !== creds.username || password !== creds.password) {
    return { ok: false, error: "Usuário ou senha incorretos." };
  }
  writeLocalSession();
  return { ok: true };
};

const logoutLocal = async () => {
  clearLocalSession();
};

const fetchApiSession = async (): Promise<CmsSessionState> => {
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

const loginApi = async (username: string, password: string): Promise<CmsLoginResult> => {
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

const logoutApi = async () => {
  try {
    await jsonFetch<{ ok: boolean }>(AUTH.logout, { method: "POST" });
  } catch {
    // Session cleared client-side regardless of network errors.
  }
};

export const fetchCmsSession = async (): Promise<CmsSessionState> =>
  resolveCmsAuthProvider() === "api" ? fetchApiSession() : fetchLocalSession();

export const loginCms = async (username: string, password: string): Promise<CmsLoginResult> =>
  resolveCmsAuthProvider() === "api" ? loginApi(username, password) : loginLocal(username, password);

export const logoutCms = async () => {
  if (resolveCmsAuthProvider() === "api") {
    await logoutApi();
  } else {
    await logoutLocal();
  }
};
