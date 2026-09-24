import { useSyncExternalStore } from "react";

export const POP_ENDPOINT = "/api/pop";

/** Abort the edge POP lookup if it hangs longer than this. */
const POP_FETCH_TIMEOUT_MS = 10_000;

export type PopPayload = {
  region: string;
  city: string | null;
  country: string | null;
};

export type PopResourceTiming = {
  latencyMs: number | null;
  protocol: string | null;
};

export type PopState =
  | { status: "loading" }
  | {
      status: "ready";
      data: PopPayload;
      latencyMs: number;
      protocol: string | null;
    }
  | { status: "error" };

function isPopPayload(value: unknown): value is PopPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.region === "string" &&
    (payload.city === null || typeof payload.city === "string") &&
    (payload.country === null || typeof payload.country === "string")
  );
}

function findLatestPopEntry(
  endpoint: string,
): PerformanceResourceTiming | null {
  if (typeof performance === "undefined") {
    return null;
  }

  try {
    const entries = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];

    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (entry.name.endsWith(endpoint)) {
        return entry;
      }
    }
  } catch {
    // Performance APIs throw on some hardened browsers.
  }

  return null;
}

/**
 * Reads transfer timing + negotiated protocol from the most recent
 * `/api/pop` PerformanceResourceTiming entry.
 *
 * Prefers `responseEnd - requestStart` (network RTT-ish) over wall-clock
 * `performance.now()` spans, which also include JSON parse and React work.
 */
export function readPopResourceTiming(endpoint: string): PopResourceTiming {
  const entry = findLatestPopEntry(endpoint);

  if (!entry) {
    return { latencyMs: null, protocol: null };
  }

  let latencyMs: number | null = null;

  if (entry.requestStart > 0 && entry.responseEnd >= entry.requestStart) {
    latencyMs = Math.max(0, Math.round(entry.responseEnd - entry.requestStart));
  } else if (entry.duration > 0) {
    latencyMs = Math.max(0, Math.round(entry.duration));
  }

  return {
    latencyMs,
    protocol: entry.nextHopProtocol || null,
  };
}

export function formatProtocol(protocol: string | null): string | null {
  if (!protocol) {
    return null;
  }

  const normalized = protocol.toLowerCase();

  if (normalized === "h3" || normalized === "h2") {
    return normalized;
  }

  if (normalized.startsWith("http/")) {
    return `h${normalized.slice(5)}`;
  }

  return normalized;
}

export function formatRegion(region: string): string {
  if (!region || region === "local") {
    return "local";
  }
  return region;
}

// One lookup per page. The hero trace and the footer chip both read this
// store, so the network tab shows a single /api/pop request and the two never
// disagree about latency. The lookup starts with the first subscriber and is
// discarded when the last one unmounts, which also keeps tests isolated.
const LOADING: PopState = { status: "loading" };

let snapshot: PopState = LOADING;
let activeController: AbortController | null = null;
const listeners = new Set<() => void>();

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function publish(next: PopState) {
  snapshot = next;
  for (const listener of listeners) {
    listener();
  }
}

function startLookup() {
  const controller = new AbortController();
  activeController = controller;

  const isCurrent = () => activeController === controller;
  const start = now();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, POP_FETCH_TIMEOUT_MS);

  fetch(POP_ENDPOINT, { cache: "no-store", signal: controller.signal })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`);
      }

      const payload: unknown = await response.json();
      const end = now();

      if (!isPopPayload(payload)) {
        throw new Error("Unexpected /api/pop payload shape");
      }

      if (!isCurrent()) {
        return;
      }

      const timing = readPopResourceTiming(POP_ENDPOINT);
      const wallClockMs = Math.max(0, Math.round(end - start));

      publish({
        status: "ready",
        data: payload,
        latencyMs: timing.latencyMs ?? wallClockMs,
        protocol: timing.protocol,
      });
    })
    .catch(() => {
      if (!isCurrent()) {
        return;
      }

      publish({ status: "error" });
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1 && !activeController) {
    startLookup();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      const controller = activeController;
      activeController = null;
      snapshot = LOADING;
      controller?.abort();
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return LOADING;
}

export function usePopTelemetry(): PopState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
