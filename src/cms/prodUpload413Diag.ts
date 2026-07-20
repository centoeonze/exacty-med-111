/**
 * TEMPORARY production 413 upload diagnostic — do not auto-run.
 * Exposes window.__EXACTY_PROD_413_DIAG__ for manual console execution after deploy.
 * Remove this file + its install call when diagnosis is complete.
 */

const INGEST_URL = "http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8";
const SESSION_ID = "387bb7";

type DiagFingerprint = {
  label: string;
  mb: number;
  fileSize: number;
  status: number;
  contentType: string | null;
  server: string | null;
  poweredBy: string | null;
  via: string | null;
  isHtml: boolean;
  bodyPreview: string;
};

const sendFingerprint = async (data: DiagFingerprint) => {
  await fetch(INGEST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: SESSION_ID,
      runId: "prod-413",
      hypothesisId: "B",
      location: "console:prod-diag",
      message: "prod upload fingerprint",
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};

const runOne = async (mb: number, label: string): Promise<DiagFingerprint> => {
  const size = Math.floor(mb * 1024 * 1024);
  const file = new File([new Uint8Array(size)], `diag-${label}.pdf`, {
    type: "application/pdf",
  });
  const body = new FormData();
  body.append("file", file);
  body.append("type", "pdf");

  const res = await fetch("/api/assets/upload", {
    method: "POST",
    credentials: "same-origin",
    body,
  });
  const rawText = await res.text();
  const contentType = res.headers.get("content-type");
  const fingerprint: DiagFingerprint = {
    label,
    mb,
    fileSize: file.size,
    status: res.status,
    contentType,
    server: res.headers.get("server"),
    poweredBy: res.headers.get("x-powered-by"),
    via: res.headers.get("via"),
    isHtml: /^\s*</.test(rawText) || /text\/html/i.test(contentType || ""),
    bodyPreview: rawText.slice(0, 280),
  };

  await sendFingerprint(fingerprint);
  return fingerprint;
};

/** Manual diagnostic: ~100 KB then ~35 MB against POST /api/assets/upload. */
export const runProdUpload413Diag = async (): Promise<DiagFingerprint[]> => {
  const small = await runOne(0.1, "small-100kb");
  const large = await runOne(35, "large-35mb");
  const results = [small, large];
  // eslint-disable-next-line no-console
  console.info("[exacty-prod-413-diag] done", results);
  return results;
};

declare global {
  interface Window {
    __EXACTY_PROD_413_DIAG__?: () => Promise<DiagFingerprint[]>;
  }
}

/** Installs global only — never runs the diagnostic automatically. */
export const installProdUpload413Diag = () => {
  if (typeof window === "undefined") return;
  window.__EXACTY_PROD_413_DIAG__ = runProdUpload413Diag;
};
