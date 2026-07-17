/**
 * Temporary Save/Publish execution trace (debug).
 * Persists steps to sessionStorage so production Hostinger can be inspected
 * even when the local debug ingest server is unreachable.
 */
export type CmsTraceStep = {
  step: number;
  label: string;
  ok: boolean;
  detail?: Record<string, unknown>;
  ts: number;
};

const TRACE_KEY = "__CMS_SAVE_PUBLISH_TRACE__";
const INGEST = "http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8";

let activeFlow: "save" | "publish" | null = null;
let steps: CmsTraceStep[] = [];

const persist = () => {
  try {
    const payload = { flow: activeFlow, steps, updatedAt: Date.now() };
    sessionStorage.setItem(TRACE_KEY, JSON.stringify(payload));
    (window as unknown as { __CMS_SAVE_PUBLISH_TRACE__?: unknown }).__CMS_SAVE_PUBLISH_TRACE__ =
      payload;
  } catch {
    // ignore
  }
};

export const cmsTraceBegin = (flow: "save" | "publish") => {
  activeFlow = flow;
  steps = [];
  persist();
};

export const cmsTrace = (
  step: number,
  label: string,
  ok = true,
  detail?: Record<string, unknown>,
) => {
  const entry: CmsTraceStep = { step, label, ok, detail, ts: Date.now() };
  steps.push(entry);
  persist();
  console.info(`[CMS-TRACE][${activeFlow}] [${step}] ${label}`, detail ?? "");
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9176a5",
    },
    body: JSON.stringify({
      sessionId: "9176a5",
      runId: "trace-full",
      hypothesisId: "TRACE",
      location: `cmsTrace:${activeFlow}:${step}`,
      message: label,
      data: { flow: activeFlow, step, ok, detail },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};

export const cmsTraceDump = () => {
  try {
    return JSON.parse(sessionStorage.getItem(TRACE_KEY) || "null");
  } catch {
    return null;
  }
};

if (typeof window !== "undefined") {
  (window as unknown as { __CMS_DUMP_TRACE__?: () => unknown }).__CMS_DUMP_TRACE__ = cmsTraceDump;
}
