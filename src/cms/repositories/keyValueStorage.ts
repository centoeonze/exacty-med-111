/**
 * Low-level key-value backend used by ApiStorageRepository.
 * Stage 1 ships Memory (tests) + Http (real API). SQLite comes later on the server.
 */
export interface IKeyValueStorage {
  get<T = unknown>(key: string): T | null;
  set<T = unknown>(key: string, value: T): void;
  remove(key: string): void;
}

/** In-memory KV — used by contract tests and as offline fallback for unit tests. */
export class MemoryKeyValueStorage implements IKeyValueStorage {
  private readonly store = new Map<string, unknown>();

  get<T = unknown>(key: string): T | null {
    if (!this.store.has(key)) return null;
    return this.store.get(key) as T;
  }

  set<T = unknown>(key: string, value: T): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}

const isHtmlOrNonJsonBody = (text: string, contentType: string | null): boolean => {
  const type = (contentType || "").toLowerCase();
  if (type.includes("text/html")) return true;
  if (type && !type.includes("application/json") && !type.includes("text/plain") && !type.includes("+json")) {
    // Unknown non-JSON content type with HTML-looking body
    if (/^\s*</.test(text)) return true;
  }
  return /^\s*</.test(text);
};

const parseApiJson = <T>(
  url: string,
  method: string,
  status: number,
  contentType: string | null,
  text: string,
): T => {
  if (isHtmlOrNonJsonBody(text, contentType)) {
    const message =
      `[ApiStorage] ${method} ${url} retornou HTML em vez de JSON ` +
      `(status ${status}, content-type: ${contentType || "n/a"}). ` +
      `A API Express não está disponível neste host — o fallback da SPA serviu index.html.`;
    console.error(message);
    throw new Error(
      "Armazenamento do CMS indisponível: a API (/api/storage) não está publicada. " +
        "Publique o Express ou configure o host para não reescrever /api/* para index.html.",
    );
  }
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch (error) {
    console.error(`[ApiStorage] ${method} ${url}: resposta não é JSON válido`, {
      status,
      contentType,
      bodyPrefix: text.slice(0, 80),
      error,
    });
    throw new Error(
      `[ApiStorage] ${method} ${url}: resposta inválida (não JSON, status ${status}).`,
    );
  }
};

/**
 * HTTP KV client against Express `GET|POST|DELETE /api/storage/:key`.
 * Uses synchronous XHR so ApiStorageRepository can keep the sync domain contract
 * until Stage 4 makes CMS callers async.
 */
export class HttpKeyValueStorage implements IKeyValueStorage {
  constructor(private readonly baseUrl = "/api/storage") {}

  get<T = unknown>(key: string): T | null {
    const url = `${this.baseUrl}/${encodeURIComponent(key)}`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    const text = xhr.responseText || "";
    const contentType = xhr.getResponseHeader("Content-Type");
    // #region agent log
    {
      const looksHtml = /^\s*</.test(text);
      fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9176a5",
        },
        body: JSON.stringify({
          sessionId: "9176a5",
          runId: "post-fix",
          hypothesisId: "A",
          location: "keyValueStorage.ts:get",
          message: "HttpKeyValueStorage GET response",
          data: {
            url,
            key,
            status: xhr.status,
            contentType,
            looksHtml,
            bodyPrefix: text.slice(0, 80),
            willSoftFail:
              xhr.status >= 200 &&
              xhr.status < 300 &&
              isHtmlOrNonJsonBody(text, contentType),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion
    if (xhr.status < 200 || xhr.status >= 300) {
      // #region agent log
      fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9176a5",
        },
        body: JSON.stringify({
          sessionId: "9176a5",
          runId: "home-pre-fix",
          hypothesisId: "A",
          location: "keyValueStorage.ts:get:non2xx",
          message: "GET non-2xx — soft-fail null (Hostinger /api 404)",
          data: { url, key, status: xhr.status, contentType },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      console.error(
        `[ApiStorage] GET ${url} failed with status ${xhr.status} — retornando null (API indisponível).`,
      );
      return null;
    }
    try {
      const body = parseApiJson<{ value?: T | null }>(
        url,
        "GET",
        xhr.status,
        contentType,
        text,
      );
      return (body.value ?? null) as T | null;
    } catch (error) {
      // Soft-fail reads so the admin shell still mounts when API is absent (static host).
      console.error("[ApiStorage] GET soft-fail — retornando null", error);
      return null;
    }
  }

  set<T = unknown>(key: string, value: T): void {
    const url = `${this.baseUrl}/${encodeURIComponent(key)}`;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ value }));
    const text = xhr.responseText || "";
    const contentType = xhr.getResponseHeader("Content-Type");
    // #region agent log
    {
      fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9176a5",
        },
        body: JSON.stringify({
          sessionId: "9176a5",
          runId: "save-post-fix",
          hypothesisId: "A",
          location: "keyValueStorage.ts:set",
          message: "HttpKeyValueStorage POST (should NOT run in local storage mode)",
          data: {
            url,
            key,
            status: xhr.status,
            contentType,
            looksHtml: /^\s*</.test(text),
            bodyPrefix: text.slice(0, 80),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`[ApiStorage] POST ${key} failed with status ${xhr.status}`);
    }
    // SPA hosts may return 200 + index.html for missing /api routes.
    if (isHtmlOrNonJsonBody(text, contentType)) {
      parseApiJson(url, "POST", xhr.status, contentType, text || "<!DOCTYPE html>");
    }
  }

  remove(key: string): void {
    const url = `${this.baseUrl}/${encodeURIComponent(key)}`;
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", url, false);
    xhr.send(null);
    const text = xhr.responseText || "";
    const contentType = xhr.getResponseHeader("Content-Type");
    // #region agent log
    {
      fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9176a5",
        },
        body: JSON.stringify({
          sessionId: "9176a5",
          runId: "post-fix",
          hypothesisId: "A",
          location: "keyValueStorage.ts:remove",
          message: "HttpKeyValueStorage DELETE response",
          data: {
            url,
            key,
            status: xhr.status,
            contentType,
            looksHtml: /^\s*</.test(text),
            bodyPrefix: text.slice(0, 80),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`[ApiStorage] DELETE ${key} failed with status ${xhr.status}`);
    }
    if (text && isHtmlOrNonJsonBody(text, contentType)) {
      parseApiJson(url, "DELETE", xhr.status, contentType, text);
    }
  }
}
