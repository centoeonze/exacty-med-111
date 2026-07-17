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

/**
 * HTTP KV client against Express `GET|POST|DELETE /api/storage/:key`.
 * Uses synchronous XHR so ApiStorageRepository can keep the sync domain contract
 * until Stage 4 makes CMS callers async.
 */
export class HttpKeyValueStorage implements IKeyValueStorage {
  constructor(private readonly baseUrl = "/api/storage") {}

  get<T = unknown>(key: string): T | null {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${this.baseUrl}/${encodeURIComponent(key)}`, false);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`[ApiStorage] GET ${key} failed with status ${xhr.status}`);
    }
    const body = JSON.parse(xhr.responseText || "{}") as { value?: T | null };
    return (body.value ?? null) as T | null;
  }

  set<T = unknown>(key: string, value: T): void {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${this.baseUrl}/${encodeURIComponent(key)}`, false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({ value }));
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`[ApiStorage] POST ${key} failed with status ${xhr.status}`);
    }
  }

  remove(key: string): void {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `${this.baseUrl}/${encodeURIComponent(key)}`, false);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`[ApiStorage] DELETE ${key} failed with status ${xhr.status}`);
    }
  }
}
